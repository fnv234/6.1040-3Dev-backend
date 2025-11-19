# 360-Degree Feedback System API Specification

This document describes the REST API endpoints for the 360-degree feedback system built with the concepts architecture.

## Base URL
```
https://six-1040-3dev-backend.onrender.com/api
```

## Authentication
All endpoints require proper authentication. Authentication is handled through the authenticated routes sync system.

## Concepts Overview

The system is built around four main concepts:
- **FeedbackForm**: Manages feedback forms and questions
- **OrgGraph**: Maintains organizational hierarchy
- **ReviewCycle**: Coordinates feedback cycles
- **ReportSynthesis**: Generates privacy-preserving reports

---

## FeedbackForm Endpoints

### Create Feedback Form
```http
POST /api/FeedbackForm/createFeedbackForm
```

**Request Body:**
```json
{
  "reviewer": "employee-id",
  "target": "employee-id", 
  "questions": [
    {
      "prompt": "How is their communication?",
      "type": "Free"
    },
    {
      "prompt": "Rate their leadership skills (1-10)",
      "type": "Scale"
    },
    {
      "prompt": "Choose their best quality",
      "type": "Multiple Choice"
    }
  ]
}
```

**Response:**
```json
{
  "feedbackForm": "form-id"
}
```

### Send Feedback Form
```http
POST /api/FeedbackForm/sendFeedbackForm
```

**Request Body:**
```json
{
  "feedbackForm": "form-id"
}
```

**Response:**
```json
{
  "link": "/feedback/form-id"
}
```

### Submit Feedback Form
```http
POST /api/FeedbackForm/submitFeedbackForm
```

**Request Body:**
```json
{
  "feedbackForm": "form-id",
  "responses": {
    "0": "Great communication skills",
    "1": "8",
    "2": "Leadership"
  }
}
```

**Response:**
```json
{}
```

### Get Feedback Form
```http
POST /api/FeedbackForm/getFeedbackForm
```

**Request Body:**
```json
{
  "id": "form-id"
}
```

**Response:**
```json
{
  "feedbackForm": {
    "_id": "form-id",
    "reviewer": "employee-id",
    "target": "employee-id",
    "status": "Created|Sent|Completed",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "completedDate": "2024-01-01T00:00:00.000Z",
    "questions": [...]
  }
}
```

### Get Feedback Forms by Target
```http
POST /api/FeedbackForm/getFeedbackFormsByTarget
```

**Request Body:**
```json
{
  "target": "employee-id",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z"
}
```

### Get Feedback Forms by Reviewer
```http
POST /api/FeedbackForm/getFeedbackFormsByReviewer
```

**Request Body:**
```json
{
  "reviewer": "employee-id"
}
```

---

## OrgGraph Endpoints

### Import Roster
```http
POST /api/OrgGraph/importRoster
```

**Request Body:**
```json
{
  "sourceData": {
    "employees": [
      {
        "id": "employee-id",
        "manager": "manager-id",
        "teamName": "Engineering"
      }
    ]
  }
}
```

### Update Manager
```http
POST /api/OrgGraph/updateManager
```

**Request Body:**
```json
{
  "employee": "employee-id",
  "newManager": "manager-id"
}
```

### Update Team
```http
POST /api/OrgGraph/updateTeam
```

**Request Body:**
```json
{
  "employee": "employee-id",
  "newTeamName": "Product"
}
```

### Get Manager
```http
POST /api/OrgGraph/getManager
```

**Request Body:**
```json
{
  "employee": "employee-id"
}
```

**Response:**
```json
{
  "manager": "manager-id"
}
```

### Get Direct Reports
```http
POST /api/OrgGraph/getDirectReports
```

**Request Body:**
```json
{
  "employee": "employee-id"
}
```

**Response:**
```json
{
  "reports": ["employee-id-1", "employee-id-2"]
}
```

### Get Peers
```http
POST /api/OrgGraph/getPeers
```

**Request Body:**
```json
{
  "employee": "employee-id"
}
```

**Response:**
```json
{
  "peers": ["peer-id-1", "peer-id-2"]
}
```

### Get All Employees
```http
POST /api/OrgGraph/getAllEmployees
```

**Response:**
```json
{
  "employees": ["employee-id-1", "employee-id-2"]
}
```

### Get All Teams
```http
POST /api/OrgGraph/getAllTeams
```

**Response:**
```json
{
  "teams": [
    {
      "_id": "team-id",
      "name": "Engineering"
    }
  ]
}
```

---

## ReviewCycle Endpoints

### Create Cycle
```http
POST /api/ReviewCycle/createCycle
```

**Request Body:**
```json
{
  "creator": "employee-id",
  "form": "form-id",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z"
}
```

**Response:**
```json
{
  "cycle": "cycle-id"
}
```

### Configure Assignments
```http
POST /api/ReviewCycle/configureAssignments
```

**Request Body:**
```json
{
  "cycle": "cycle-id",
  "targets": ["employee-id-1", "employee-id-2"]
}
```

### Add Reviewers
```http
POST /api/ReviewCycle/addReviewers
```

**Request Body:**
```json
{
  "cycle": "cycle-id",
  "target": "employee-id",
  "reviewers": ["reviewer-id-1", "reviewer-id-2"]
}
```

### Activate Cycle
```http
POST /api/ReviewCycle/activate
```

**Request Body:**
```json
{
  "cycle": "cycle-id"
}
```

### Submit Feedback
```http
POST /api/ReviewCycle/submitFeedback
```

**Request Body:**
```json
{
  "cycle": "cycle-id",
  "target": "employee-id",
  "reviewer": "reviewer-id",
  "responses": {
    "0": "Great communication",
    "1": "8",
    "2": "Leadership"
  }
}
```

### Close Cycle
```http
POST /api/ReviewCycle/close
```

**Request Body:**
```json
{
  "cycle": "cycle-id"
}
```

### Get Active Cycles
```http
POST /api/ReviewCycle/getActiveCycles
```

**Response:**
```json
{
  "cycles": [
    {
      "_id": "cycle-id",
      "createdBy": "employee-id",
      "isActive": true,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    }
  ]
}
```

### Get Reviewer Tasks
```http
POST /api/ReviewCycle/getReviewerTasks
```

**Request Body:**
```json
{
  "reviewer": "employee-id"
}
```

**Response:**
```json
{
  "tasks": [
    {
      "cycle": "cycle-id",
      "target": "employee-id",
      "form": "form-id",
      "endDate": "2024-01-31T23:59:59.999Z"
    }
  ]
}
```

---

## ReportSynthesis Endpoints

### Ingest Responses
```http
POST /api/ReportSynthesis/ingestResponses
```

**Request Body:**
```json
{
  "target": "employee-id",
  "form": "form-id",
  "responses": [
    {
      "questionIndex": 0,
      "questionText": "How is their communication?",
      "response": "Great communication skills",
      "reviewer": "reviewer-id"
    }
  ],
  "anonymityFlag": true,
  "kThreshold": 3
}
```

**Response:**
```json
{
  "responseSet": "response-set-id"
}
```

### Apply K-Anonymity
```http
POST /api/ReportSynthesis/applyKAnonymity
```

**Request Body:**
```json
{
  "responseSet": "response-set-id"
}
```

### Extract Themes
```http
POST /api/ReportSynthesis/extractThemes
```

**Request Body:**
```json
{
  "responseSet": "response-set-id"
}
```

**Response:**
```json
{
  "themes": ["Communication", "Leadership", "Collaboration"]
}
```

### Draft Summary with LLM
```http
POST /api/ReportSynthesis/draftSummaryLLM
```

**Request Body:**
```json
{
  "responseSet": "response-set-id",
  "themes": ["Communication", "Leadership"]
}
```

**Response:**
```json
{
  "draft": "Based on the feedback collected, the employee demonstrates strong communication skills..."
}
```

### Approve Summary
```http
POST /api/ReportSynthesis/approveSummary
```

**Request Body:**
```json
{
  "responseSet": "response-set-id",
  "finalText": "Final approved summary text",
  "keyQuotes": ["Great communication", "Strong leadership"]
}
```

### Get Final Report
```http
POST /api/ReportSynthesis/getFinalReport
```

**Request Body:**
```json
{
  "responseSet": "response-set-id"
}
```

**Response:**
```json
{
  "report": {
    "_id": "report-id",
    "target": "employee-id",
    "textSummary": "Final summary text",
    "keyQuotes": ["Quote 1", "Quote 2"],
    "metrics": {
      "totalResponses": 5,
      "uniqueReviewers": 3
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Reports by Target
```http
POST /api/ReportSynthesis/getReportsByTarget
```

**Request Body:**
```json
{
  "target": "employee-id"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Vue.js Integration Notes

For Vue.js frontend integration:

1. **Base API Client**: Create an axios-based API client with the base URL
2. **Authentication**: Implement token-based auth headers for all requests
3. **Error Handling**: Handle error responses consistently across components
4. **Loading States**: Show loading indicators during API calls
5. **Data Models**: Create TypeScript interfaces matching the API response types

### Example Vue.js API Service:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const feedbackAPI = {
  createForm: (data: CreateFormRequest) => 
    api.post('/FeedbackForm/createFeedbackForm', data),
  
  submitForm: (data: SubmitFormRequest) => 
    api.post('/FeedbackForm/submitFeedbackForm', data),
  
  getReviewerTasks: (reviewer: string) => 
    api.post('/ReviewCycle/getReviewerTasks', { reviewer }),
};
```

### Key Frontend Features to Implement:

1. **Dashboard**: Show reviewer tasks and cycle status
2. **Form Builder**: Create and configure feedback forms
3. **Feedback Submission**: User-friendly form interface
4. **Org Chart Viewer**: Visualize organizational structure
5. **Report Viewer**: Display generated feedback reports
6. **Admin Panel**: Manage cycles and view analytics
