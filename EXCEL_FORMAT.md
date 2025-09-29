# Sample Excel File Format for DSA Tracker

## Required Columns

Your Excel file should have exactly 2 columns with these headers:

| Column Name | Description | Example |
|-------------|-------------|---------|
| **title** | Problem name | "Two Sum" |
| **link** | Problem URL | "https://leetcode.com/problems/two-sum/" |

## Supported Column Name Variations

The system accepts these column names (case-insensitive):
- **For title**: `title`, `Title`, `TITLE`, `problem`, `Problem`
- **For link**: `link`, `Link`, `LINK`, `url`, `URL`

## Sample Data

```
title                           | link
Two Sum                         | https://leetcode.com/problems/two-sum/
Valid Parentheses               | https://leetcode.com/problems/valid-parentheses/
Reverse Linked List             | https://leetcode.com/problems/reverse-linked-list/
Binary Tree Inorder Traversal   | https://leetcode.com/problems/binary-tree-inorder-traversal/
Maximum Subarray                | https://leetcode.com/problems/maximum-subarray/
```

## File Requirements

- **Format**: .xls or .xlsx
- **Size**: Maximum 5MB
- **Sheet**: Only the first sheet will be processed
- **Rows**: No limit on number of problems

## Important Notes

1. ✅ First row should contain column headers
2. ✅ All rows must have both title and link
3. ✅ Empty rows will be skipped
4. ✅ Whitespace will be automatically trimmed
5. ❌ You can only upload problems once - delete existing problems before uploading new ones
6. ❌ Don't include extra columns - only title and link are required

## Quick Start

1. Create an Excel file (.xlsx)
2. Add headers: `title` and `link`
3. Fill in your DSA problems
4. Upload via the dashboard
5. Start practicing!
