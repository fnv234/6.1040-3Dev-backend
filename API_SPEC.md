# 360-Degree Feedback System API Specification

This document describes the REST API endpoints for the 360-degree feedback system built with the concepts architecture.

## Base URL
```
https://six-1040-3dev-backend.onrender.com/api
```

## Authentication
All endpoints require proper authentication. Authentication is handled through the authenticated routes sync system.

## Concepts Overview

The system is built around five main concepts:
- **HRAdmin**: Manages HR administrator authentication
- **OrgGraph**: Maintains organizational hierarchy
- **FormTemplate**: Stores HR-admin-created form templates
- **AccessCode**: Manages unique access codes for forms and response storage
- **ReportSynthesis**: Generates privacy-preserving feedback reports

---

## HRAdmin Endpoints

### Register HRAdmin
```http
POST /api/HRAdmin/registerHRAdmin
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "hrAdmin": "admin-id"
}
```

**Notes:**
- Email must be unique
- Password is hashed using SHA-256 before storage
- Returns error if email already exists

### Authenticate HRAdmin
```http
POST /api/HRAdmin/authenticateHRAdmin
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "hrAdmin": "admin-id"
}
```

**Notes:**
- Returns error if credentials are invalid
- Both email and password are required

### Get HRAdmin
```http
POST /api/HRAdmin/getHRAdmin
```

**Request Body:**
```json
{
  "hrAdminId": "admin-id"
}
```

**Response:**
```json
{
  "hrAdminData": {
    "_id": "admin-id",
    "email": "admin@example.com"
  }
}
```

**Notes:**
- Password is never returned in responses for security

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
        "email": "employee@example.com",
        "manager": "manager-id",
        "teamNames": ["Engineering", "Innovation"],
        "role": "Developer"
      }
    ]
  },
  "owner": "admin-id"
}
```

**Response:**
```json
{}
```

**Notes:**
- `teamNames` is an array of team names the employee belongs to
- `email` is required for each employee
- `manager` and `role` are optional
- Prevents circular reporting relationships
- `owner` is optional for multi-tenant scenarios

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

**Request Body:**
```json
{
  "owner": "admin-id"
}
```

**Response:**
```json
{
  "teams": [
    {
      "_id": "team-id",
      "name": "Engineering",
      "members": ["employee-id-1", "employee-id-2"],
      "membersWithRoles": [
        {
          "memberId": "employee-id-1",
          "role": "Developer",
          "email": "dev@example.com"
        }
      ],
      "owner": "admin-id"
    }
  ]
}
```

**Notes:**
- `owner` parameter is optional for multi-tenant scenarios

### Get Team Members
```http
POST /api/OrgGraph/getTeamMembers
```

**Request Body:**
```json
{
  "teamId": "team-id"
}
```

**Response:**
```json
{
  "members": ["employee-id-1", "employee-id-2"]
}
```

---

## FormTemplate Endpoints

### Get Template
```http
POST /api/FormTemplate/getTemplate
```

**Request Body:**
```json
{
  "templateId": "template-id"
}
```

**Response:**
```json
{
  "template": {
    "_id": "template-id",
    "name": "Q3 2024 Performance Review",
    "creator": "admin-id",
    "teamId": "team-id",
    "status": "Created|Sent|Completed",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "questions": [
      {
        "prompt": "How is their communication?",
        "type": "Multiple Choice|Free|Scale",
        "targetRoles": ["Developer", "Manager"]
      }
    ]
  }
}
```

**Notes:**
- Valid question types: "Multiple Choice", "Free", "Scale"
- `targetRoles` is optional - if specified, only members with these roles will see the question

### Get Templates by Creator
```http
POST /api/FormTemplate/getTemplatesByCreator
```

**Request Body:**
```json
{
  "creator": "admin-id"
}
```

**Response:**
```json
{
  "templates": [
    {
      "_id": "template-id",
      "name": "Q3 2024 Performance Review",
      "creator": "admin-id",
      "teamId": "team-id",
      "status": "Created|Sent|Completed",
      "createdDate": "2024-01-01T00:00:00.000Z",
      "questions": [...]
    }
  ]
}
```

**Notes:**
- Returns templates sorted by creation date (newest first)

---

## AccessCode Endpoints

### Create Access Code
```http
POST /api/AccessCode/createAccessCode
```

**Request Body:**
```json
{
  "accessCode": "ABC123",
  "formId": "form-template-id",
  "teamId": "team-id",
  "memberId": "employee-id",
  "memberEmail": "employee@example.com",
  "memberRole": "Developer",
  "createdBy": "admin-id"
}
```

**Response:**
```json
{
  "accessCodeId": "access-code-id"
}
```

**Notes:**
- `accessCode` must be unique
- `memberRole` is optional
- All other fields are required

### Get Access Code
```http
POST /api/AccessCode/getAccessCode
```

**Request Body:**
```json
{
  "accessCode": "ABC123"
}
```

**Response:**
```json
{
  "accessCode": {
    "_id": "access-code-id",
    "accessCode": "ABC123",
    "formId": "form-template-id",
    "used": false
  }
}
```

**Notes:**
- Returns basic access code information
- Returns error if access code is invalid

### Get Access Code Info
```http
POST /api/AccessCode/getAccessCodeInfo
```

**Request Body:**
```json
{
  "accessCode": "ABC123"
}
```

**Response:**
```json
{
  "accessCodeInfo": {
    "_id": "access-code-id",
    "accessCode": "ABC123",
    "formId": "form-template-id",
    "teamId": "team-id",
    "memberId": "employee-id",
    "memberEmail": "employee@example.com",
    "memberRole": "Developer",
    "createdBy": "admin-id",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "used": false,
    "usedDate": null
  }
}
```

**Notes:**
- Returns detailed access code information including metadata
- Returns error if access code is invalid

### Submit Form Response
```http
POST /api/AccessCode/submitFormResponse
```

**Request Body:**
```json
{
  "accessCode": "ABC123",
  "responses": {
    "0": "Great communication skills",
    "1": "8",
    "2": "Leadership"
  }
}
```

**Response:**
```json
{
  "responseId": "response-id"
}
```

**Notes:**
- Access code must be valid and not already used
- All response values must be non-empty
- Marks access code as used after successful submission

### Get Form Responses
```http
POST /api/AccessCode/getFormResponses
```

**Request Body:**
```json
{
  "formId": "form-template-id",
  "createdBy": "admin-id"
}
```

**Response:**
```json
{
  "responses": [
    {
      "_id": "response-id",
      "accessCode": "ABC123",
      "formId": "form-template-id",
      "teamId": "team-id",
      "memberId": "employee-id",
      "memberEmail": "employee@example.com",
      "memberRole": "Developer",
      "responses": {
        "0": "Great communication skills",
        "1": "8",
        "2": "Leadership"
      },
      "submittedDate": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Notes:**
- User must be the creator of the form template
- Returns responses sorted by submission date (newest first)

### Delete Access Code
```http
POST /api/AccessCode/deleteAccessCode
```

**Request Body:**
```json
{
  "accessCode": "ABC123"
}
```

**Response:**
```json
{}
```

**Notes:**
- Permanently removes the access code
- Returns error if access code doesn't exist

---

## ReportSynthesis Endpoints

### Get Report by Form Template
```http
POST /api/ReportSynthesis/getReportByFormTemplate
```

**Request Body:**
```json
{
  "formTemplate": "form-template-id"
}
```

**Response:**
```json
{
  "report": {
    "_id": "report-id",
    "formTemplate": "form-template-id",
    "textSummary": "Based on the feedback collected, the employee demonstrates strong communication skills...",
    "keyThemes": ["Communication", "Leadership", "Collaboration"],
    "keyQuotes": ["Great communication", "Strong leadership"],
    "metrics": {
      "totalResponses": 5,
      "uniqueRespondents": 3,
      "questionsAnswered": 3,
      "averageResponseLength": 25.5,
      "roleDistribution": {
        "Developer": 2,
        "Manager": 1
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  } | null
}
```

**Notes:**
- Returns the most recent report for the form template
- Returns null if no report exists

### Get All Reports
```http
POST /api/ReportSynthesis/getAllReports
```

**Response:**
```json
{
  "reports": [
    {
      "_id": "report-id",
      "formTemplate": "form-template-id",
      "textSummary": "Based on the feedback collected...",
      "keyThemes": ["Communication", "Leadership"],
      "keyQuotes": ["Great communication"],
      "metrics": {
        "totalResponses": 5,
        "uniqueRespondents": 3
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Notes:**
- Returns all synthesized reports sorted by creation date (newest first)

### Generate Form Template Report
```http
POST /api/ReportSynthesis/generateFormTemplateReport
```

**Request Body:**
```json
{
  "formTemplateId": "form-template-id",
  "createdBy": "admin-id",
  "anonymityFlag": true,
  "kThreshold": 3
}
```

**Response:**
```json
{
  "report": {
    "_id": "report-id",
    "formTemplate": "form-template-id",
    "textSummary": "Generated summary text...",
    "keyThemes": ["Communication", "Leadership"],
    "keyQuotes": ["Key quote 1", "Key quote 2"],
    "metrics": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notes:**
- User must be the creator of the form template
- Complete workflow that ingests responses, applies anonymity, extracts themes, and generates summary
- `anonymityFlag` defaults to true, `kThreshold` defaults to 3

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
    "formTemplate": "form-template-id",
    "textSummary": "Final approved summary text",
    "keyThemes": ["Communication", "Leadership"],
    "keyQuotes": ["Great communication", "Strong leadership"],
    "metrics": {
      "totalResponses": 5,
      "uniqueRespondents": 3
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notes:**
- Returns error if response set doesn't exist or has no synthesized report

### Get Response Set
```http
POST /api/ReportSynthesis/getResponseSet
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
  "responseSetData": {
    "_id": "response-set-id",
    "formTemplate": "form-template-id",
    "responses": [
      {
        "questionIndex": 0,
        "questionText": "How is their communication?",
        "response": "Great communication skills",
        "respondent": "employee-id",
        "respondentRole": "Developer"
      }
    ],
    "anonymityFlag": true,
    "kThreshold": 3,
    "synthesizedReport": "report-id"
  }
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
  baseURL: 'https://six-1040-3dev-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const feedbackAPI = {
  // HR Admin
  authenticate: (email: string, password: string) => 
    api.post('/HRAdmin/authenticateHRAdmin', { email, password }),
  
  // Form Templates
  getTemplates: (creator: string) => 
    api.post('/FormTemplate/getTemplatesByCreator', { creator }),
  getTemplate: (templateId: string) =>
    api.post('/FormTemplate/getTemplate', { templateId }),
  
  // Access Codes
  createAccessCode: (data: CreateAccessCodeRequest) => 
    api.post('/AccessCode/createAccessCode', data),
  getAccessCode: (accessCode: string) =>
    api.post('/AccessCode/getAccessCode', { accessCode }),
  getAccessCodeInfo: (accessCode: string) =>
    api.post('/AccessCode/getAccessCodeInfo', { accessCode }),
  submitFormResponse: (accessCode: string, responses: Record<string, string>) =>
    api.post('/AccessCode/submitFormResponse', { accessCode, responses }),
  getFormResponses: (formId: string, createdBy: string) =>
    api.post('/AccessCode/getFormResponses', { formId, createdBy }),
  deleteAccessCode: (accessCode: string) =>
    api.post('/AccessCode/deleteAccessCode', { accessCode }),
  
  // Reports
  generateReport: (formTemplateId: string, createdBy: string) => 
    api.post('/ReportSynthesis/generateFormTemplateReport', { 
      formTemplateId, 
      createdBy 
    }),
  getReportByFormTemplate: (formTemplate: string) =>
    api.post('/ReportSynthesis/getReportByFormTemplate', { formTemplate }),
  getAllReports: () =>
    api.post('/ReportSynthesis/getAllReports', {}),
};
```

### Key Frontend Features to Implement:

1. **Dashboard**: Show form templates and generated reports
2. **Form Builder**: Create and configure feedback form templates
3. **Access Code Management**: Generate and manage access codes for team members
4. **Org Chart Viewer**: Visualize organizational structure
5. **Report Viewer**: Display generated feedback reports with themes and metrics
6. **Admin Panel**: Manage templates, access codes, and view analytics
