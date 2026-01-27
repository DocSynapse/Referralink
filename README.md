# Referralink

## A Clinical Decision Support System for Modern Healthcare

Referralink is a thoughtfully designed clinical decision support platform built to serve healthcare professionals with humility and precision. It combines the power of artificial intelligence with healthcare domain expertise to help medical teams make informed clinical decisions, particularly in referral pathways and patient triage scenarios.

---

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [System Requirements](#system-requirements)
- [Installation Guide](#installation-guide)
- [Usage Instructions](#usage-instructions)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Acknowledgments](#acknowledgments)
- [Support](#support)
- [License](#license)

---

## Introduction

### Our Purpose

Healthcare professionals face complex decisions daily, often under time constraints and with incomplete information. Referralink was built with the understanding that good clinical decision-making requires more than just data—it requires thoughtful analysis, evidence-based guidance, and support systems that healthcare workers can trust.

We approached this project with humility, recognizing that no system can replace clinical judgment. Instead, we've focused on creating a tool that enhances decision-making by providing:

- Clear, evidence-based analysis of patient presentations
- Structured clinical reasoning with appropriate confidence indicators
- Support for referral pathway navigation
- Professional documentation capabilities
- Transparent AI-assisted insights that healthcare teams can understand and act upon

### What Makes Referralink Different

Rather than overwhelming healthcare professionals with complexity, we've intentionally focused on:

- **Clarity and Simplicity**: Clean interfaces that communicate clinical information effectively without unnecessary distraction
- **Evidence-Based Guidance**: Analysis grounded in established medical classifications and guidelines
- **Professional Integrity**: Tools built with respect for clinical expertise and patient safety
- **Transparency**: Clear explanation of how recommendations are generated
- **Accessibility**: Designed for healthcare professionals of varying technical backgrounds

We recognize that healthcare technology should serve the professionals and patients it touches. This principle guides every decision we make about Referralink's development.

---

## Key Features

Referralink provides several core capabilities designed to support clinical workflows:

### Medical Diagnosis Analysis

The system analyzes clinical presentations and provides:
- ICD-10 code classifications with confidence scoring
- Systematic assessment of clinical severity and urgency
- Red flag detection for critical or emergency conditions
- Structured clinical reasoning with supporting evidence
- Multi-domain assessment frameworks

### Clinical Triage and Urgency Classification

Automated triage support including:
- Emergency, Urgent, Semi-Urgent, and Routine classification
- Severity assessment across multiple clinical domains
- Risk stratification with functional impact analysis
- Identification of comorbidities and complications

### Referral Pathway Guidance

Support for referral decision-making:
- Evidence-based specialist recommendations
- Competency level assessment aligned with healthcare system standards
- Alternative referral options when applicable
- Clear documentation of clinical rationale

### Professional Documentation

Clinical documentation capabilities:
- PDF generation for medical certificates and referral notes
- Health and illness certification forms
- Structured medical record formatting
- Professional report generation for stakeholder communication

### Real-Time Clinical Processing

Modern development with:
- Live processing logs showing clinical reasoning steps
- Session history and query tracking
- Result caching for efficiency
- Fallback data for connectivity considerations

### Administrative Features

Support for healthcare administration:
- Multiple user roles and portal selection
- Document generation tools
- Session management
- User authentication and access control

---

## Use Cases

Referralink serves several important healthcare scenarios:

### Primary Care Referral Support

Primary healthcare facilities use Referralink to determine when patients require specialist evaluation and which specialty is most appropriate.

### Emergency Department Triage

Emergency and urgent care settings leverage the platform for rapid triage and appropriateness determination for specialist consultation.

### Specialist Recommendation

Healthcare providers use the system to identify optimal specialists based on clinical presentation and available competencies.

### Medical Documentation

Administrative staff and clinicians use Referralink to generate professional medical certificates and referral documentation.

### Clinical Training

Healthcare education programs use the system as a teaching tool to support clinical reasoning and decision-making skills.

---

## System Requirements

### Prerequisites

Before installing Referralink, please ensure your system meets these requirements:

- **Node.js**: Version 16.x or higher (18.x and above recommended)
- **Package Manager**: npm 8.x or higher, or pnpm 8.x and above
- **Git**: For version control and repository management
- **Database** (for memory service): PostgreSQL 13 or higher with pgvector extension
- **Python** (optional, for memory service): Python 3.11 or higher

### API Requirements

To use Referralink's AI-powered features, you will need:

- An API key for one or more AI services
- Network connectivity to AI service providers
- Valid credentials configured in your environment

### Verification Steps

Verify your installation:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check git installation
git --version
```

All versions should match or exceed the minimum requirements listed above.

---

## Installation Guide

### Step 1: Clone the Repository

Begin by obtaining the Referralink source code:

```bash
git clone https://github.com/DocSynapse/Referralink.git
cd Referralink
```

### Step 2: Install Dependencies

Install the required Node.js packages using your preferred package manager:

```bash
# Using npm
npm install

# Or using pnpm (recommended for efficiency)
pnpm install

# Or using yarn
yarn install
```

The installation process will download and configure all necessary dependencies from the npm registry.

### Step 3: Configure Environment Variables

Create a local environment configuration file:

```bash
cp .env.example .env.local
```

Open the `.env.local` file and configure your API credentials. The configuration should include:

```env
# OpenRouter Configuration (recommended)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_API_BASE_URL=https://openrouter.ai/api/v1

# AI Model Selection
VITE_AI_MODEL_NAME=deepseek/deepseek-chat

# Optional: Alternative AI Services
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_QWEN_API_KEY=your_qwen_api_key_here

# API Settings
VITE_API_TIMEOUT=30000
```

### Obtaining API Keys

- **OpenRouter**: Visit https://openrouter.ai to create an account and generate an API key
- **DeepSeek**: Register at https://www.deepseek.com for direct API access
- **Alternative Providers**: Configuration for additional AI services is available

### Step 4: Start the Development Server

Launch Referralink locally:

```bash
npm run dev
```

The development server will start and display the local URL where Referralink is accessible. Typically:

```
http://localhost:5173
```

Open this URL in your web browser. You should see the Referralink welcome screen and portal interface.

### Step 5: (Optional) Build for Production

When you're ready to deploy Referralink to a production environment:

```bash
# Create an optimized production build
npm run build

# Optional: Preview the production build locally
npm run preview
```

The production files will be created in the `dist/` directory and are ready for deployment to any static hosting service.

### Setting Up the Memory Service (Optional)

For advanced features including semantic search and agent memory:

```bash
# Navigate to memory service directory
cd services/memory_service

# Create Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start PostgreSQL (ensure Docker is installed)
docker-compose up -d

# Start the memory service
python run.py
```

The memory service will listen on port 9420.

---

## Usage Instructions

### Getting Started

After successfully installing Referralink, follow these steps to begin using the system:

#### Initial Access

1. Open Referralink in your web browser (typically http://localhost:5173)
2. You will see the portal selection interface
3. Select your user role or platform type from the available options

#### Entering Clinical Information

1. Navigate to the clinical input section
2. Enter the patient's clinical presentation
3. Provide relevant medical history and symptoms
4. Include any clinical findings or diagnostic information available

#### Analyzing Clinical Data

1. Click the analyze or process button
2. Referralink will process the clinical information using AI analysis
3. The system will display:
   - Suggested ICD-10 codes
   - Clinical triage and urgency level
   - Specialist recommendations
   - Clinical reasoning and supporting evidence
   - Risk assessments and red flag indicators

#### Reviewing Results

- Examine the detailed analysis provided
- Review the confidence scores and reasoning
- Check the recommended referral pathway
- Consider alternative recommendations if provided
- Note any clinical alerts or red flags highlighted

#### Generating Documentation

1. Click the export or generate report option
2. Select your desired document type (referral letter, medical certificate, etc.)
3. Review the generated document
4. Download or save the PDF file for your records

### Common Workflows

#### Weekly Clinical Review

```
Monday: Enter new patient cases from your clinic
Tuesday: Run clinical analysis on submitted cases
Wednesday: Review referral recommendations
Thursday: Generate documentation for appropriate referrals
Friday: Archive completed cases and prepare reports
```

#### Emergency Department Usage

```
Patient Arrival → Input clinical presentation → Generate urgent triage assessment →
Communicate specialist recommendation → Document decision → Continue care
```

#### Administrative Documentation

```
Receive referral request → Enter clinical details → Generate certificate →
Review and approve → Distribute to receiving facility
```

### Key Commands and Functions

Common tasks and their execution:

```bash
# Development server with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

### Best Practices

For optimal use of Referralink:

**Data Quality**
- Enter complete and accurate clinical information
- Use consistent terminology and classification
- Update patient status as clinical situations evolve
- Document clinical reasoning and decision-making

**Clinical Use**
- Always verify AI recommendations against your clinical judgment
- Consider the patient's full clinical context
- Use confidence scores as one factor in decision-making
- Maintain appropriate documentation of your clinical decisions

**System Management**
- Monitor API usage to avoid service interruptions
- Keep environment credentials secure and updated
- Maintain regular backups of important data
- Review system logs for optimization opportunities

**Performance**
- Cache frequently accessed results to reduce API calls
- Limit simultaneous analyses during high usage periods
- Consider batch processing for multiple cases
- Export data periodically for backup and archival

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Blank Page or Loading Error

**Symptoms**: Referralink displays a blank page or hangs on the loading screen.

**Solutions**:
1. Clear your browser cache and cookies
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that the development server is running (npm run dev)
4. Verify your internet connection
5. Check browser console for JavaScript errors (F12)

#### Issue: API Connection Failures

**Symptoms**: Error messages about API connectivity or timeout errors.

**Solutions**:
1. Verify your API key is correctly configured in .env.local
2. Check that your API key has not expired
3. Ensure your account has sufficient API quota
4. Test your network connection to the AI service
5. Check the API service status page for outages

#### Issue: Environment Variables Not Loading

**Symptoms**: Environment variables appear to be undefined.

**Solutions**:
1. Ensure .env.local file exists in the project root
2. Verify variable names are prefixed with VITE_ for frontend
3. Restart the development server after modifying .env.local
4. Check file encoding (should be UTF-8)
5. Ensure no spaces around equals signs in variable definitions

#### Issue: Build Failures

**Symptoms**: npm run build fails or produces errors.

**Solutions**:
1. Clear node_modules and reinstall: rm -rf node_modules && npm install
2. Clear build cache: rm -rf dist/
3. Check Node version matches requirements
4. Verify all dependencies are properly installed
5. Review build error messages for specific issues

#### Issue: Memory Service Connection Problems

**Symptoms**: Memory-dependent features fail or show errors.

**Solutions**:
1. Verify PostgreSQL is running: docker-compose ps
2. Check memory service is running on port 9420
3. Verify database credentials in config
4. Review database logs for connection errors
5. Restart the memory service

### Getting Help

If you encounter issues not covered here:

1. Check the Troubleshooting guide in docs/TROUBLESHOOTING.md
2. Review the Development guide in docs/DEVELOPMENT.md
3. Search existing GitHub Issues for similar problems
4. Open a new issue with detailed information about your problem
5. Contact the maintainers through the GitHub discussion forum

---

## Project Structure

Understanding the project organization helps with development and customization:

```
Referralink/
├── App.tsx                          # Main application component
├── index.tsx                        # React entry point
├── types.ts                         # TypeScript type definitions
├── constants.ts                     # Application constants
├── index.css                        # Global styles
│
├── components/                      # React components
│   ├── PortalSelection.tsx         # Platform selection interface
│   ├── AdminPanel.tsx              # Administrative tools
│   ├── DataCard.tsx                # Result display components
│   ├── LogTerminal.tsx             # Processing logs
│   ├── ReferralDeck.tsx            # Referral presentation
│   ├── WaitlistPage.tsx            # Waitlist management
│   ├── SplashScreen.tsx            # Welcome screen
│   ├── ComponentShowcase.tsx        # Component demo
│   └── ui/                         # Utility components
│       ├── text-block-animation.tsx
│       └── background-patterns.tsx
│
├── services/                        # Business logic services
│   ├── geminiService.ts            # AI model integration
│   ├── cacheService.ts             # Result caching
│   └── memory_service/             # Python backend
│       ├── main.py                 # FastAPI application
│       ├── config.py               # Configuration
│       ├── database.py             # Database setup
│       ├── models/                 # Database models
│       ├── routers/                # API endpoints
│       ├── services/               # Service logic
│       └── schemas/                # Data validation
│
├── lib/                            # Utility functions
├── constants/                      # Named constants
│
├── public/                         # Static assets
│   ├── images/                    # Image files
│   └── icons/                     # Icon assets
│
├── docs/                          # Documentation
│   ├── API.md                     # API reference
│   ├── DEVELOPMENT.md             # Development guide
│   └── TROUBLESHOOTING.md         # Troubleshooting guide
│
├── package.json                   # Node dependencies
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Build configuration
├── tailwind.config.js             # Tailwind CSS config
├── postcss.config.js              # PostCSS configuration
│
├── .env.example                   # Environment template
├── README.md                      # This file
├── CONTRIBUTING.md               # Contributing guidelines
├── CHANGELOG.md                  # Version history
├── SECURITY.md                   # Security policy
└── LICENSE                       # License file
```

---

## Contributing

We welcome contributions from healthcare professionals, developers, and technology enthusiasts who share our vision for better clinical decision support. Whether you're fixing a bug, adding a feature, suggesting improvements, or enhancing documentation, your participation helps create a better tool for healthcare professionals worldwide.

### Types of Contributions We Welcome

- Bug reports that help us identify and fix issues
- Feature suggestions and enhancement ideas
- Documentation improvements and clarifications
- Code contributions implementing features or fixes
- User experience and design feedback
- Accessibility improvements
- Performance optimizations

### How to Report Issues

If you've identified a problem:

1. Check existing GitHub Issues to avoid duplication
2. Create a new issue with:
   - Clear, descriptive title
   - Detailed description of the problem
   - Steps to reproduce the issue
   - Expected behavior vs. actual behavior
   - Your environment (operating system, Node version, browser)
   - Screenshots or error logs if applicable
   - Any relevant code samples

### How to Submit Code Contributions

We follow a straightforward contribution workflow:

#### 1. Fork the Repository

Click the "Fork" button on the GitHub repository page.

#### 2. Create a Feature Branch

```bash
# For new features
git checkout -b feature/descriptive-feature-name

# For bug fixes
git checkout -b fix/descriptive-bug-fix
```

#### 3. Make Your Changes

- Write clear, focused changes
- Follow the coding standards outlined below
- Keep commits small and atomic
- Write meaningful commit messages
- Add comments only where logic isn't immediately clear

#### 4. Follow Coding Standards

**TypeScript and JavaScript**:
- Use TypeScript for type safety where possible
- Prefer const over let, avoid var
- Use arrow functions for callbacks
- Write descriptive variable and function names
- Keep functions focused on a single responsibility

**React Components**:
```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div className="p-4">
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
};
```

**Styling**:
- Use Tailwind CSS utility classes
- Keep custom CSS minimal
- Use semantic HTML
- Maintain responsive design

#### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a clear message
git commit -m "feat(scope): brief description of changes"
```

We follow Conventional Commits format:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring without behavioral change
- `perf`: Performance improvement
- `test`: Test additions or modifications
- `chore`: Maintenance and build tasks

#### 6. Push and Create a Pull Request

```bash
git push origin feature/descriptive-feature-name
```

When creating your pull request:
- Fill in the PR template with details
- Link any related issues
- Describe the testing you performed
- Explain the motivation for the change

### Code Review Process

Your contribution will go through the following process:

1. **Submission**: You submit a pull request
2. **Initial Review**: Team members review your code and changes
3. **Feedback**: You may receive suggestions or requests for modifications
4. **Revision**: Address feedback constructively
5. **Approval**: A maintainer approves the changes
6. **Merge**: Your contribution is merged into the main branch

We appreciate your patience during code review and are committed to providing constructive, respectful feedback.

### Development Guidelines

- Keep pull requests focused and reasonably sized
- Write clear commit messages explaining the "why"
- Test your changes thoroughly before submitting
- Keep the code style consistent with the existing codebase
- Update CHANGELOG.md for significant changes
- Consider the user experience impact of your changes

### Getting Help with Contributions

If you need guidance:
- Open an issue labeled "question"
- Comment on the issue you're working on
- Start a GitHub Discussion
- Review existing documentation (DEVELOPMENT.md, CONTRIBUTING.md)

---

## Frequently Asked Questions

### General Questions

**Q: What is Referralink designed for?**

A: Referralink is a clinical decision support system designed to help healthcare professionals with clinical decision-making, particularly in referral determination and patient triage. It combines AI analysis with healthcare domain knowledge to provide evidence-based recommendations.

**Q: Is Referralink intended to replace clinical judgment?**

A: No. Referralink is designed to support and enhance clinical decision-making, not replace it. Clinical professionals should always apply their judgment and expertise when using the system's recommendations.

**Q: Who should use Referralink?**

A: Referralink is designed for healthcare professionals including physicians, nurses, clinical staff, and administrative healthcare workers who make or support referral decisions.

**Q: What medical coding systems does Referralink use?**

A: Referralink primarily uses ICD-10 classification codes along with competency level assessments aligned with healthcare system standards.

### Technical Questions

**Q: What browsers does Referralink support?**

A: Referralink works in modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using recent versions for the best experience.

**Q: Can I use Referralink offline?**

A: Referralink requires internet connectivity for AI analysis features. Some features may have fallback behavior for connectivity interruptions.

**Q: How secure is my data in Referralink?**

A: Please review our Security Policy (SECURITY.md) for detailed information about data handling, encryption, and security practices.

**Q: Can I deploy Referralink on my own servers?**

A: Yes, Referralink can be self-hosted. See the Development guide for deployment options and architecture details.

**Q: What are the storage requirements?**

A: Frontend requirements are minimal (typical disk space for dependencies and build artifacts). The memory service (if used) requires PostgreSQL database storage proportional to your data volume.

### API and Integration Questions

**Q: What AI services does Referralink support?**

A: Referralink supports multiple AI services including OpenRouter, DeepSeek, and others. See the configuration section for setup details.

**Q: How do I obtain API keys?**

A: Visit the respective service provider's website to create an account and generate API keys. Instructions are provided in the Installation Guide.

**Q: Are there rate limits on API usage?**

A: Rate limits depend on your specific API plan. Monitor your usage to avoid unexpected service interruptions.

**Q: What happens if the API is unavailable?**

A: Referralink includes fallback mechanisms and caching to handle temporary API unavailability gracefully.

### Contributing Questions

**Q: How long does code review take?**

A: Code review times vary based on complexity and reviewer availability. We aim to provide initial feedback within a reasonable timeframe.

**Q: Can I work on multiple features at once?**

A: We recommend focusing on one feature at a time to keep pull requests focused and reviewable.

**Q: Are there coding style requirements?**

A: Yes, see the Coding Standards section in the Contributing guide for details on TypeScript, React, and styling conventions.

**Q: How do I report security vulnerabilities?**

A: See SECURITY.md for the responsible disclosure process for security issues.

### Usage and Deployment Questions

**Q: How do I update Referralink?**

A: Pull the latest changes from the repository and run npm install to get the latest dependencies.

**Q: Can I customize the interface?**

A: Yes, the codebase is open source and can be modified to suit your needs. See the Development guide for customization guidance.

**Q: Is there a Docker image available?**

A: Docker support and deployment options are documented in the Development guide (docs/DEVELOPMENT.md).

**Q: How do I monitor system performance?**

A: See the Development guide and Troubleshooting documentation for monitoring and optimization guidance.

---

## Acknowledgments

Referralink was built with gratitude for the open source community, healthcare technology pioneers, and everyone who contributed to its development.

### Open Source Projects

We stand on the shoulders of excellent open source projects:

- React: The foundational UI framework enabling interactive interfaces
- Vite: Modern build tooling providing fast development and optimized production builds
- Tailwind CSS: Utility-first CSS framework enabling rapid, maintainable styling
- TypeScript: Type system providing reliability and developer experience
- Material Web: Material Design components and design system
- Lucide React: Consistent, high-quality icon library
- Framer Motion: Animation and motion library for smooth interactions
- GSAP: Advanced animation platform for complex motion design
- jsPDF: PDF generation and document creation
- OpenAI SDK: AI integration library
- FastAPI: High-performance Python web framework
- PostgreSQL: Reliable, feature-rich database system
- pgvector: Vector similarity search in PostgreSQL

### AI Services

We're grateful for the AI platforms that power Referralink's analysis:

- DeepSeek: Advanced reasoning and analysis capabilities
- OpenRouter: Multi-model AI service platform
- Alternative AI providers enabling choice and flexibility

### Contributors and Community

We extend sincere thanks to:

- Healthcare professionals who guided the design and functionality
- Early adopters who provided invaluable feedback
- Contributors who submitted code and documentation improvements
- The open source community sharing knowledge and tools
- Everyone reporting issues and suggesting improvements
- Patients and healthcare teams whose needs inspire our work

### Special Recognition

To everyone using Referralink to improve healthcare delivery: Your trust and feedback drive our commitment to continuous improvement. We're honored to support your important work.

---

## Support

We're here to help you succeed with Referralink.

### Getting Help

For questions, issues, or guidance:

- **Bug Reports and Issues**: GitHub Issues (https://github.com/DocSynapse/Referralink/issues)
- **Questions and Discussions**: GitHub Discussions
- **Security Concerns**: See SECURITY.md for responsible disclosure
- **Contributing Questions**: See CONTRIBUTING.md or open a GitHub Discussion

### Additional Resources

- API Documentation: docs/API.md
- Development Guide: docs/DEVELOPMENT.md
- Troubleshooting Guide: docs/TROUBLESHOOTING.md
- Security Policy: SECURITY.md
- Version History: CHANGELOG.md
- Contributing Guidelines: CONTRIBUTING.md

---

## License

Referralink is licensed under the MIT License, allowing broad use while maintaining appropriate attribution.

Under the MIT License:
- You may use Referralink in personal and commercial projects
- You may modify the code
- You may distribute modified versions
- You must retain the license and copyright notice
- The software is provided as-is without warranty

See the LICENSE file for the complete legal text.

---

## Project Status

**Current Version**: 0.1.0 (Beta)

**Development Status**: Active Development

**Last Updated**: January 2026

**Node.js Support**: 16.x through 22.x

**React Support**: 19.2.1 and above

**Python Support**: 3.11 and above (for optional features)

---

## Closing Remarks

Referralink represents our commitment to thoughtful healthcare technology that respects both the expertise of healthcare professionals and the needs of patients. We believe great tools are built with care, humility, and continuous input from the communities they serve.

Thank you for your interest in Referralink. We look forward to working with you to make clinical decision support more accessible, reliable, and beneficial for healthcare professionals worldwide.

---

Architected & built Docsynapse

MIT License - See LICENSE file for details
