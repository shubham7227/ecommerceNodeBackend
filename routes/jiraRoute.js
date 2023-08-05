const express = require("express");
const {
  getIssueTypes,
  getIssueFields,
  getIssueTransitions,
  addIssue,
  updateIssue,
} = require("../controllers/jiraController");
const router = express.Router();

router.post("/", addIssue);

router.get("/issue-types", getIssueTypes);

router.get("/issue-fields", getIssueFields);

router.get("/:id/issue-transitions", getIssueTransitions);

router.put("/:id", updateIssue);

module.exports = router;
