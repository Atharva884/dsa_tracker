// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const generatedSection = document.getElementById('generatedSection');
    const problemsList = document.getElementById('problemsList');
    const submitButtonContainer = document.getElementById('submitButtonContainer');
    const submitProblemsBtn = document.getElementById('submitProblemsBtn');

    // Track selected problems
    let selectedProblems = [];

    // Generate 5 random problems
    if (generateBtn) {
        generateBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/generate-problems');
                const result = await response.json();

                if (result.success) {
                    displayProblems(result.data, false);
                    generatedSection.style.display = 'block';
                    submitButtonContainer.style.display = 'block';
                    selectedProblems = []; // Reset selected problems
                    
                    // Scroll to generated section
                    generatedSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to generate problems');
            }
        });
    }

    // View all problems
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/my-problems');
                const result = await response.json();

                if (result.success) {
                    displayProblems(result.data, true);
                    generatedSection.style.display = 'block';
                    submitButtonContainer.style.display = 'none'; // Hide submit for view all
                    
                    // Scroll to generated section
                    generatedSection.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to fetch problems');
            }
        });
    }

    // Display problems function
    function displayProblems(problems, showAll = false) {
        if (problems.length === 0) {
            problemsList.innerHTML = '<div class="alert alert-warning">No problems to display</div>';
            return;
        }

        let html = '<div class="list-group">';
        
        problems.forEach((problem, index) => {
            const statusBadge = problem.done 
                ? '<span class="badge bg-success">Completed</span>' 
                : '<span class="badge bg-warning">Pending</span>';
            
            const checkboxDisabled = problem.done ? 'disabled checked' : '';
            
            html += `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">
                                ${index + 1}. ${problem.title} - 
                                <a href="${problem.link}" target="_blank" class="text-primary text-decoration-underline">
                                    <i class="bi bi-link-45deg"></i> Link
                                </a>
                            </h6>
                        </div>
                        <div class="d-flex align-items-center gap-3">
                            ${!problem.done && !showAll ? `
                                <div class="form-check">
                                    <input class="form-check-input mark-done-checkbox" 
                                           type="checkbox" 
                                           data-id="${problem._id}" 
                                           ${checkboxDisabled}>
                                    <label class="form-check-label small">Mark as Done</label>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        problemsList.innerHTML = html;

        // Add event listeners to checkboxes (only for tracking, not submitting)
        if (!showAll) {
            document.querySelectorAll('.mark-done-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const problemId = this.dataset.id;
                    
                    if (this.checked) {
                        // Add to selected problems
                        if (!selectedProblems.includes(problemId)) {
                            selectedProblems.push(problemId);
                        }
                    } else {
                        // Remove from selected problems
                        selectedProblems = selectedProblems.filter(id => id !== problemId);
                    }
                    
                    console.log('Selected problems:', selectedProblems);
                });
            });
        }
    }

    // Submit button handler
    if (submitProblemsBtn) {
        submitProblemsBtn.addEventListener('click', async function() {
            if (selectedProblems.length === 0) {
                alert('Please select at least one problem to mark as done');
                return;
            }

            // Disable button and show loading
            submitProblemsBtn.disabled = true;
            submitProblemsBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';

            try {
                // Submit all selected problems
                const promises = selectedProblems.map(problemId => 
                    fetch('/mark-done', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ problemId })
                    })
                );

                await Promise.all(promises);

                // Success - reload page to update stats
                window.location.reload();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to submit completed problems');
                
                // Re-enable button
                submitProblemsBtn.disabled = false;
                submitProblemsBtn.innerHTML = '<i class="bi bi-check-circle"></i> Submit Completed Problems';
            }
        });
    }

    // Form submission loading state
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            // Trigger form submission
            if (uploadForm.checkValidity()) {
                uploadBtn.disabled = true;
                uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
                uploadForm.submit();
            } else {
                // Show validation message
                uploadForm.reportValidity();
            }
        });
    }
});
