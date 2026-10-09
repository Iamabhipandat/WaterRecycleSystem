JalLoop — Smart Water Recycling System

Recycle Water. Reduce Waste. Build a Sustainable Future.

JalLoop is a smart water recycling and monitoring system designed to reduce freshwater consumption by collecting, monitoring, filtering, and reusing wastewater from sources such as RO systems and washing machines. It also supports rainwater collection monitoring.

The project combines an interactive web dashboard with Firebase-based data integration and hardware-control capabilities to provide visibility into water collection, recycling, reuse, and freshwater savings.
Table of Contents

Overview

Problem Statement

Key Features

How It Works

Technology Stack

System Architecture

Getting Started

Project Structure

Demo and Live Modes

Security Considerations

Future Enhancements

Contributing

License

💡 Overview

Freshwater is a limited resource, yet a considerable amount of household wastewater can potentially be reused for non-potable purposes instead of being discarded.

JalLoop aims to make water reuse more accessible through a centralized monitoring dashboard that helps users understand water flow, observe recycling activity, monitor tank levels, and track water-saving metrics.

The system is designed around three main stages:

Collection: Monitor wastewater from RO systems, washing machines, and rainwater sources.

Recycling: Represent filtration stages and pumping activity while tracking recycled water.

Reuse: Monitor recycled-water usage for suitable non-potable applications, such as gardening, toilet flushing, and cleaning.

The application includes a simulation mode for exploring the system without connected hardware and a live mode for integration with supported hardware through Firebase.

🎯 Problem Statement

Traditional household water systems often discard reusable wastewater, increasing freshwater demand and unnecessary water wastage.

JalLoop addresses this challenge by providing a technology-driven approach to:

Improve visibility into household water collection and reuse.

Monitor recycling operations and water storage levels.

Track water collected, recycled, and reused.

Estimate freshwater savings.

Support the integration of software monitoring with physical hardware.

Encourage sustainable water-management practices.

✨ Key Features

1. Interactive Water-Flow Dashboard

Visualizes the water recycling process, including collection tanks, filtration stages, pumping activity, recycled-water storage, and reuse status.

2. Multiple Water Sources

Supports monitoring and control interfaces for:

RO wastewater collection

Washing-machine wastewater collection

Rainwater collection

3. Water Recycling Controls

Provides controls to start or stop recycling operations and monitor the progression through filtration stages.

4. Water Usage Analytics

Displays key metrics to help users understand system activity:

Total water collected

Total water recycled

Total water reused

Estimated freshwater saved

5. Tank Monitoring and Alerts

Tracks collection and recycled-water tank levels. The simulation includes safeguards that stop pumping when the recycled-water tank approaches its configured capacity or the collection tank becomes empty.

6. Demo and Live Hardware Modes

Demo Mode: Simulates water collection, filtration, pumping, and reuse using application state.

Live Mode: Integrates with Firebase for supported telemetry, device status, and hardware commands.

7. Authentication and Admin Dashboard

Includes an authentication flow and a separate admin dashboard for authorized administrative access.

8. Hardware Status Indicators

Provides visual indicators representing system components and their operational states, helping users understand the status of the recycling process.

9. Activity Log

Records recent system events, such as starting water collection, beginning filtration, activating the pump, and switching operating modes.

⚙️ How It Works

Wastewater and rainwater collection sources are monitored.

Collected water is represented in the collection tank.

The recycling process progresses through the configured filtration stages.

Pumping transfers water into the recycled-water storage tank.

Recycled water can be marked as being used for non-potable applications.

The dashboard updates water metrics, tank levels, activity logs, and system status.

In live mode, supported hardware data and commands are exchanged through Firebase.

Important: The application provides monitoring and control functionality. Actual water treatment effectiveness and water quality must be verified separately before any real-world reuse.

🧰 Technology Stack

Technology

Purpose

React

Component-based user interface

Vite

Development server and build tooling

JavaScript (ES Modules)

Application logic

Tailwind CSS

Responsive styling

Firebase

Authentication and real-time data integration

Recharts

Water usage analytics and charts

Lucide React

Icons and interface elements

Wokwi

Hardware simulation resources in the repository

Embedded firmware

Hardware integration resources

🏗️ System Architecture

flowchart TD
    A[RO Wastewater] --> D[Water Collection]
    B[Washing Machine] --> D
    C[Rainwater] --> D

    D --> E[Collection Tank]
    E --> F[Filtration Stages]
    F --> G[Pump]
    G --> H[Recycled Water Tank]
    H --> I[Non-Potable Reuse]

    J[React Dashboard] <--> K[Firebase]
    K <--> L[Hardware / Firmware]

    J --> M[Water Metrics and Analytics]
    J --> N[System Status and Alerts]
    J --> O[Simulation Controls]

The dashboard can run in simulation mode without relying on physical hardware. In live mode, Firebase provides the integration layer between the web application and supported hardware components.

🚀 Getting Started

Prerequisites

Install the following before running the application:

Node.js (a version compatible with the installed Vite release)

npm

Git

A Firebase project for authentication and live data integration

1. Clone the Repository

git clone https://github.com/Iamabhipandat/WaterRecycleSystem.git

2. Navigate to the Project Directory

cd WaterRecycleSystem

3. Install Dependencies

npm install

4. Configure Firebase

Create or select a Firebase project in the Firebase Console.

Enable the Firebase services required by the application, including authentication and Realtime Database where applicable.

Configure the project's Firebase credentials using the configuration expected by the application. Keep private credentials and privileged service-account keys out of version control.

If the project uses environment variables, create a local .env file using the variable names expected by the Firebase configuration module.

5. Start the Development Server

npm run dev

Open the local URL displayed in your terminal, typically:

http://localhost:5173

6. Build for Production

npm run build

7. Preview the Production Build

npm run preview

8. Run the Linter

npm run lint

📁 Project Structure

WaterRecycleSystem/
├── firmware/                  # Hardware firmware resources
├── public/                    # Static public assets
├── src/
│   ├── components/
│   │   ├── Navbar
│   │   ├── WaterFlowSystem
│   │   ├── SimulationControls
│   │   ├── WaterMetrics
│   │   ├── Analytics
│   │   ├── SystemStatus
│   │   └── HardwareLeds
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useFirebaseData
│   ├── pages/
│   │   ├── AuthPage
│   │   └── AdminDashboard
│   ├── utils/
│   │   └── hardware
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── wokwi/                     # Hardware simulation resources
├── database.rules.json        # Firebase Realtime Database rules
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js

The tree above summarizes the main application modules; exact filenames and extensions may vary.

🔄 Demo and Live Modes

Demo Mode

Demo mode allows users to explore the water recycling workflow without physical hardware. Water collection, filtration progression, pumping, and reuse are simulated within the application.

Live Mode

Live mode connects the dashboard to the configured Firebase integration. Supported telemetry and commands can synchronize the user interface with compatible hardware.

Live mode requires valid Firebase configuration, suitable database rules, and compatible firmware or hardware. The interface alone does not guarantee that a physical device is connected or that a command was executed successfully.

🔐 Security Considerations

Before deploying JalLoop in a real environment:

Restrict Firebase read and write permissions to authorized users.

Require authentication and enforce role-based authorization for administrative operations.

Avoid unrestricted database access to sensor data, commands, and device-control paths.

Validate incoming sensor values and outgoing hardware commands.

Store secrets in environment variables and never commit private keys.

Test access controls using Firebase's security rules simulator.

Production note: Review database.rules.json before deployment. Public read/write permissions for device-control or sensor paths can expose the system to unauthorized access. Use restrictive, authenticated rules appropriate to the application's data model.

🔮 Future Enhancements

Potential improvements include:

Integration with real water-level, flow-rate, and water-quality sensors.

Automated leak detection and abnormal-flow alerts.

Water-quality monitoring using appropriate sensors and treatment validation.

Water-consumption forecasting and efficiency recommendations.

Historical data storage and downloadable reports.

Mobile-friendly notifications for tank levels and system faults.

Automated scheduling for water collection and reuse.

Improved monitoring of device connectivity and hardware failures.

Deployment documentation and automated testing.

🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

Fork the repository.

Create a feature branch:

git checkout -b feature/your-feature

Make your changes and test them.

Commit your work:

git commit -m "Add your feature"

Push the branch:

git push origin feature/your-feature

Open a pull request describing your changes.

📄 License

No license has been specified in this README. Add a LICENSE file and update this section once the project's intended license has been selected.

🌱 Project Goal

JalLoop demonstrates how web technologies, real-time data integration, and hardware-oriented controls can be combined to support more efficient water management.

The goal is simple: make water reuse easier to monitor, understand, and improve.

