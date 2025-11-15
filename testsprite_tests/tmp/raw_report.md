
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** S3E-System-PRO
- **Date:** 2025-11-14
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** Budget Creation and Cost Calculation
- **Test Code:** [TC001_Budget_Creation_and_Cost_Calculation.py](./TC001_Budget_Creation_and_Cost_Calculation.py)
- **Test Error:** The test to create a detailed budget including materials, kits, and services was partially successful. Multiple items were added, and the automatic cost calculation and margin computation appeared to update accordingly. However, the budget could not be saved due to a persistent client selection validation error, despite multiple attempts to select the client. Therefore, the full budget creation and save process could not be completed. Please verify the client selection functionality to enable successful budget creation.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/30e32db6-2bcb-47ce-b400-5919b28308c7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** Budget PDF Generation with Customization and Watermark
- **Test Code:** [TC002_Budget_PDF_Generation_with_Customization_and_Watermark.py](./TC002_Budget_PDF_Generation_with_Customization_and_Watermark.py)
- **Test Error:** The task to verify generation of customizable PDF budgets with correct data, template application, watermark display, and download functionality was partially completed. We successfully logged in, navigated to the budgets section, opened an existing budget, and reached the PDF customization page where budget details and template preview are visible. However, the watermark image upload could not be completed due to limitations in file input handling, preventing full verification of watermark display in the PDF. The PDF generation and download functionality were not tested. Therefore, the task is not fully finished.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/53904eb6-bbf4-4907-98b7-f68ef7d20b41
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Dashboard Real-time Statistics and Alerts
- **Test Code:** [TC003_Dashboard_Real_time_Statistics_and_Alerts.py](./TC003_Dashboard_Real_time_Statistics_and_Alerts.py)
- **Test Error:** Stopped testing due to login form validation error preventing access to the dashboard. Reported the issue for resolution. Cannot proceed with dashboard update verification without successful login.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/d1ee1fb5-b9e0-4e5c-a60e-8ee626b30389
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** Project Creation from Approved Budgets
- **Test Code:** [TC004_Project_Creation_from_Approved_Budgets.py](./TC004_Project_Creation_from_Approved_Budgets.py)
- **Test Error:** Reported the issue of missing conversion option for approved budgets. Task to check conversion of approved budgets into sales and linked projects cannot proceed further due to this blocking issue.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/fe56be93-b315-41fb-bc09-800ff6de9fb2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Kanban Board Project Status Management
- **Test Code:** [TC005_Kanban_Board_Project_Status_Management.py](./TC005_Kanban_Board_Project_Status_Management.py)
- **Test Error:** The Kanban board allows creating new tasks and assigning initial statuses successfully. However, it does not support drag-and-drop or any alternative UI method to change the status of tasks/projects. Clicking on a project card only opens a context menu with options Visualizar, Editar, and Excluir, without enabling status transitions. Therefore, the validation of task movement and status updates via Kanban board is incomplete and cannot be fully verified.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/5cb51062-c8e3-4022-bfbd-0ec6ea87a06f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Worksite Task Progress and Photo Reporting
- **Test Code:** [TC006_Worksite_Task_Progress_and_Photo_Reporting.py](./TC006_Worksite_Task_Progress_and_Photo_Reporting.py)
- **Test Error:** The worksite allocation element in the Calendário de Alocações page is unresponsive, preventing further testing of task assignments, progress tracking, photo uploads, and team allocation accuracy. Issue has been reported. Stopping the test here.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/9e6e2827-5005-4506-9d00-db765b2ade86
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Team and Resource Scheduling with Gantt Charts
- **Test Code:** [TC007_Team_and_Resource_Scheduling_with_Gantt_Charts.py](./TC007_Team_and_Resource_Scheduling_with_Gantt_Charts.py)
- **Test Error:** Resource assignment interface is not accessible via the calendar or alternative navigation. This blocks testing of availability controls and Gantt chart visualization. Reporting this as a blocking issue for developer resolution.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/af52f615-c0ba-461c-a59a-84bc775f0e24
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Client Management CRUD Operations
- **Test Code:** [TC008_Client_Management_CRUD_Operations.py](./TC008_Client_Management_CRUD_Operations.py)
- **Test Error:** Client creation failed due to form submission issue. Reported the problem and stopped further testing as CRUD operations cannot proceed without successful client creation.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[ERROR] Failed to load resource: the server responded with a status of 400 (Bad Request) (at http://localhost:3001/api/clientes:0:0)
[ERROR] API Error: AxiosError (at http://localhost:5173/src/services/axiosApi.ts?t=1763143707645:41:16)
[WARNING] ⚠️ Erro ao criar cliente: {success: false, error: HTTP error! status: 400} (at http://localhost:5173/src/services/clientesService.ts?t=1763143707645:84:16)
[WARNING] ⚠️ Erro ao salvar: HTTP error! status: 400 (at http://localhost:5173/src/components/ClientesModerno.tsx?t=1763143707645:179:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/7de010c1-458e-47e7-9003-5ecc1a306787
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Material Stock Control and Alerts
- **Test Code:** [TC009_Material_Stock_Control_and_Alerts.py](./TC009_Material_Stock_Control_and_Alerts.py)
- **Test Error:** Testing stopped due to critical issue: The Estoque page is empty and does not display any stock information or controls. This prevents validation of stock deduction and alert notification features. Please investigate and fix the issue before retrying.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/api/materiais:0:0)
[ERROR] API Error: AxiosError (at http://localhost:5173/src/services/axiosApi.ts?t=1763143707645:41:16)
[WARNING] ⚠️ Erro ao criar material: {success: false, error: HTTP error! status: 500} (at http://localhost:5173/src/services/materiaisService.ts?t=1763143707645:80:16)
[WARNING] %s

%s
 An error occurred in the <Materiais> component. Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries. (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=4e53a170:6965:16)
[WARNING] %s

%s
 An error occurred in the <StatCard> component. Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries. (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=4e53a170:6965:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/58c9bc01-981c-4403-922b-41f0edfefe91
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Supplier and Purchase Order Management
- **Test Code:** [TC010_Supplier_and_Purchase_Order_Management.py](./TC010_Supplier_and_Purchase_Order_Management.py)
- **Test Error:** The CRUD operations on suppliers and purchase orders were successfully tested: a new supplier was created and listed properly; a purchase order was created linked to the supplier with items added; the purchase invoice upload was attempted but skipped; the purchase order was marked as completed with status 'Recebido'; however, the final verification of inventory stock updates reflecting the purchased materials could not be completed due to page loading or navigation issues in the stock management section. Therefore, the task is partially complete with all steps done except the final stock verification.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ImmutableStateInvariantMiddleware took 40ms, which is more than the warning threshold of 32ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that. (at http://localhost:5173/node_modules/.vite/deps/recharts.js?v=4e53a170:6669:16)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3001/api/compras:0:0)
[ERROR] API Error: AxiosError (at http://localhost:5173/src/services/axiosApi.ts?t=1763143707645:41:16)
[WARNING] %s

%s
 An error occurred in the <Materiais> component. Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries. (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=4e53a170:6965:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/720c8dd1-c2f3-4811-beb7-52ef0b121d8d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** Financial Module Transactions and Reporting
- **Test Code:** [TC011_Financial_Module_Transactions_and_Reporting.py](./TC011_Financial_Module_Transactions_and_Reporting.py)
- **Test Error:** Testing stopped due to navigation issue: 'Contas a Pagar' section is not accessible from the Financeiro menu. Accounts receivable creation and verification completed successfully. Unable to proceed with accounts payable and fixed expenses testing. Please fix the navigation issue to continue testing.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ImmutableStateInvariantMiddleware took 37ms, which is more than the warning threshold of 32ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that. (at http://localhost:5173/node_modules/.vite/deps/recharts.js?v=4e53a170:6669:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/4ad7d539-3cf6-42bd-8539-70310ddce8fa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Electronic Invoice (NFe) Issuance and Status Control
- **Test Code:** [TC012_Electronic_Invoice_NFe_Issuance_and_Status_Control.py](./TC012_Electronic_Invoice_NFe_Issuance_and_Status_Control.py)
- **Test Error:** Reported the issue that the 'Próximo →' button does not advance the page from 'Selecionar Venda' to 'Dados Fiscais' step in the NF-e issuance process, blocking further testing of electronic invoice issuance. Stopping further actions.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ImmutableStateInvariantMiddleware took 39ms, which is more than the warning threshold of 32ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that. (at http://localhost:5173/node_modules/.vite/deps/recharts.js?v=4e53a170:6669:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/cccf6546-e0e5-4169-a718-cd4b8d51fa30
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** Role-based Access Control Enforcement
- **Test Code:** [TC013_Role_based_Access_Control_Enforcement.py](./TC013_Role_based_Access_Control_Enforcement.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/f2d25b67-49ab-4af6-b6f4-b6683af01f2e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** Data Import and Export in CSV, JSON, and XML Formats
- **Test Code:** [TC014_Data_Import_and_Export_in_CSV_JSON_and_XML_Formats.py](./TC014_Data_Import_and_Export_in_CSV_JSON_and_XML_Formats.py)
- **Test Error:** Export functionality on the admin dashboard is not working as expected. Clicking the 'Exportar dados' button does not initiate any export process or show any options. Unable to proceed with testing import/export of materials, templates, and invoices. Stopping the test here.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/244bfbb8-650d-4cde-9121-e31fcb3e1fbc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** Audit Log Capture and Traceability
- **Test Code:** [TC015_Audit_Log_Capture_and_Traceability.py](./TC015_Audit_Log_Capture_and_Traceability.py)
- **Test Error:** Audit logs section is missing or inaccessible, preventing verification of critical user actions and unauthorized attempts. Task stopped due to inability to complete audit log verification for security and compliance.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/cbae3ed5-cf5d-4207-a7f8-c596cdad7d67
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** User Interface Responsiveness and Accessibility
- **Test Code:** [TC016_User_Interface_Responsiveness_and_Accessibility.py](./TC016_User_Interface_Responsiveness_and_Accessibility.py)
- **Test Error:** Testing stopped due to critical issue: Dashboard page is empty after login and interaction, preventing further accessibility and error handling tests. Responsiveness tests on desktop, tablet, and mobile views were successful. Recommend development team investigate and fix this issue to enable full testing.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] %s

%s
 An error occurred in the <StatCard> component. Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries. (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=4e53a170:6965:16)
[WARNING] %s

%s
 An error occurred in the <StatCard> component. Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries. (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=4e53a170:6965:16)
[WARNING] %s

%s
 An error occurred in the <StatCard> component. Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries. (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=4e53a170:6965:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/347d3f40-40e2-43c3-8b3b-ad232165ecee
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017
- **Test Name:** Authentication System with JWT Token Handling
- **Test Code:** [TC017_Authentication_System_with_JWT_Token_Handling.py](./TC017_Authentication_System_with_JWT_Token_Handling.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/b1eced42-056c-4f0f-b492-73437b782429
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018
- **Test Name:** Error Handling on Invalid Input Data
- **Test Code:** [TC018_Error_Handling_on_Invalid_Input_Data.py](./TC018_Error_Handling_on_Invalid_Input_Data.py)
- **Test Error:** Tested client form validation with invalid and missing data successfully. However, navigation to the 'Orçamentos' module failed, preventing further testing of other core modules. Reporting this issue and stopping the test as per instructions.
Browser Console Logs:
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
[WARNING] ⚠️ [ProtectedRoute] Usuário NÃO autenticado, redirecionando para login... (at http://localhost:5173/src/components/ProtectedRoute.tsx:47:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5898eb5-aaf3-4952-8fe0-4f2635a4173a/1ec4c7b9-246f-4b07-ab01-e4015f493d27
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **11.11** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---