const Problem = require("../models/Problem");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Upload Excel and Parse Problems (with optimized duplicate detection)
exports.uploadProblems = async function (req, res) {
  try {
    if (!req.file) {
      req.session.uploadError = "Please upload an Excel file";
      return res.redirect("/dashboard");
    }

    const userId = req.session.user.id;
    const filePath = req.file.path;

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    // Validate and format data from Excel
    const problems = [];
    const errors = [];

    data.forEach((row, index) => {
      // Check if row has title and link (case-insensitive)
      const title = row.title || row.Title || row.TITLE || row.problem || row.Problem;
      const link = row.link || row.Link || row.LINK || row.url || row.URL;

      if (!title || !link) {
        errors.push(`Row ${index + 2}: Missing title or link`);
      } else {
        problems.push({
          title: title.toString().trim(),
          link: link.toString().trim(),
        });
      }
    });

    // Delete the uploaded file after reading
    fs.unlinkSync(filePath);

    if (errors.length > 0) {
      req.session.uploadError = `Upload failed: ${errors.join(", ")}`;
      return res.redirect("/dashboard");
    }

    if (problems.length === 0) {
      req.session.uploadError = "No valid problems found in the Excel file";
      return res.redirect("/dashboard");
    }

    // OPTIMIZED DUPLICATE DETECTION
    const problemModel = new Problem();
    
    // Step 1: Fetch all existing problems for this user (single query)
    const existingProblems = await problemModel.getByUserId(userId);
    
    // Step 2: Create Sets for fast O(1) lookup (in-memory)
    const existingTitles = new Set(existingProblems.map(p => p.title.toLowerCase()));
    const existingLinks = new Set(existingProblems.map(p => p.link.toLowerCase()));
    
    // Step 3: Filter out duplicates (in-memory, very fast)
    const newProblems = problems.filter(problem => {
      const isDuplicateTitle = existingTitles.has(problem.title.toLowerCase());
      const isDuplicateLink = existingLinks.has(problem.link.toLowerCase());
      return !isDuplicateTitle && !isDuplicateLink;
    });

    const duplicateCount = problems.length - newProblems.length;

    // Step 4: Insert only new problems (single batch insert)
    if (newProblems.length > 0) {
      await problemModel.insertMany(newProblems, userId);
    }

    // Success message with details
    if (newProblems.length === 0) {
      req.session.uploadError = `No new problems added. All ${duplicateCount} problems already exist in your list.`;
    } else if (duplicateCount === 0) {
      req.session.uploadSuccess = `Successfully added ${newProblems.length} new problems!`;
    } else {
      req.session.uploadSuccess = `Successfully added ${newProblems.length} new problems! (${duplicateCount} duplicate${duplicateCount > 1 ? 's' : ''} skipped)`;
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Upload error:", error);
    
    // Delete file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    req.session.uploadError = "Failed to upload problems. Please try again.";
    res.redirect("/dashboard");
  }
};

// Get all problems for logged-in user
exports.getMyProblems = async function (req, res) {
  try {
    const userId = req.session.user.id;
    const problemModel = new Problem();
    const problems = await problemModel.getByUserId(userId);

    res.json({
      success: true,
      data: problems,
      message: "Problems fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
    });
  }
};

// Get statistics
exports.getStats = async function (req, res) {
  try {
    const userId = req.session.user.id;
    const problemModel = new Problem();
    const stats = await problemModel.getStats(userId);

    res.json({
      success: true,
      data: stats,
      message: "Statistics fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};

// Generate random problems
exports.generateProblems = async function (req, res) {
  try {
    const userId = req.session.user.id;
    const problemModel = new Problem();
    
    const problems = await problemModel.getRandomUnsolved(userId, 5);

    if (problems.length === 0) {
      return res.json({
        success: false,
        message: "No unsolved problems available. All problems completed!",
      });
    }

    res.json({
      success: true,
      data: problems,
      message: `Generated ${problems.length} random problems`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate problems",
    });
  }
};

// Mark problem as done
exports.markAsDone = async function (req, res) {
  try {
    const { problemId } = req.body;
    const problemModel = new Problem();
    
    await problemModel.markAsDone(problemId);

    res.json({
      success: true,
      message: "Problem marked as done",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to mark problem as done",
    });
  }
};

// Reset cycle
exports.resetCycle = async function (req, res) {
  try {
    const userId = req.session.user.id;
    const problemModel = new Problem();
    
    await problemModel.resetCycle(userId);

    req.session.uploadSuccess = "Cycle reset successfully! All problems are now unsolved.";
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    req.session.uploadError = "Failed to reset cycle";
    res.redirect("/dashboard");
  }
};

// Delete all problems
exports.deleteAllProblems = async function (req, res) {
  try {
    const userId = req.session.user.id;
    const problemModel = new Problem();
    
    await problemModel.deleteAllByUserId(userId);

    req.session.uploadSuccess = "All problems deleted successfully!";
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    req.session.uploadError = "Failed to delete problems";
    res.redirect("/dashboard");
  }
};
