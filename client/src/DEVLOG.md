## Week 1: Environment & Backend Core
- **Goal:** Initialize project and connect DB.
- **Tech:** Node.js, Express, MongoDB Atlas, Mongoose.
- **Progress:**
  - Created Monorepo structure (Client/Server).
  - Configured .env for security.
  - Connected to MongoDB Atlas.
  - Created 'Report' Schema.
  - Tested POST /api/reports endpoint with Postman (Success).
- **Next:** Build Frontend Form Wizard.


## Week 2: The Logic & Safety Core
- **Goal:** Build the UI, Admin Dashboard, and Implement Safety Protocols.
- **Tech:** React, Tailwind, Geolocation API, JWT/Mock Auth.
- **Progress:**
  - **Frontend:** Built the "Wizard" reporting interface (Category -> Details -> Success).
  - **Geolocation:** Implemented High-Accuracy GPS tracking.
  - **Admin Dashboard:** Created a secured portal for Responders (Police/NGOs).
  - **Security (RBAC):** 
    - Implemented "Organization" models.
    - Built a Login System to separate Victims from Responders.
    - Implemented logic where different orgs see different data.
  - **Safety Logic:**
    - Added "Police Consent" checkbox.
    - Backend filters out Police access unless user consents.
  - **Media Prep:** Configured Cloudinary on the backend for evidence storage.
- **Next:** Frontend File Uploads & Deployment.


## Week 3: Active Rescue & Intelligent UX
- **Goal:** Transform the app from a passive reporting tool into an active coordinated response system.
- **Tech:** React Custom Components, REST APIs (Countries), MongoDB Updates.
- **Progress:**
  - **Coordinated Response System:**
    - Implemented "Claim Case" logic.
    - Responders can see if a case is already being handled by another agency (preventing overlap).
    - Added "In Progress" status tracking.
  - **AI Safety Advisor:**
    - Built a rule-based engine that provides immediate, context-specific safety advice (e.g., "Avoid kitchen" for Domestic Violence) directly within the form.
  - **Enhanced Contact Protocol:**
    - Added "Immediate Callback" vs "Scheduled Safe Time" logic.
    - Integrated Searchable Country Code dropdown using public API.
    - Added "Voicemail Safety" check to protect victims from discovery.
  - **UX/Safety Overhaul:**
    - Made GPS location mandatory and automatic on load.
    - Embedded "Best Practices" guide for writing reports.
- **Next:** Final Deployment (Vercel/Render) and Organization Registration.