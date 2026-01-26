<div align="center">
<img width="1200" height="475" alt="Referralink Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Referralink - AI-Powered Referral System

> An intelligent referral management platform leveraging AI to streamline the referral process, provide data insights, and enhance user engagement.

## 🚀 Overview

Referralink is a modern, AI-enhanced referral system that enables seamless referral management with intelligent data analysis capabilities. Built with cutting-edge web technologies and powered by AI endpoints, it provides a clean interface for tracking, managing, and optimizing referral campaigns.

The platform addresses the need for transparent, data-driven referral management by offering:
- Real-time referral tracking and analytics
- AI-powered data insights and recommendations
- Beautiful, responsive user interface
- Export capabilities for reporting
- Secure, production-ready infrastructure

## ✨ Features

- **Intelligent Data Analysis** - AI-powered insights from your referral data
- **Real-time Dashboard** - Monitor referral metrics at a glance
- **Comprehensive Tracking** - Full referral pipeline visibility
- **Export to PDF** - Generate professional reports
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Modern UI Components** - Material Design and custom components
- **API Integration** - Multiple AI endpoint support (Gemini, DeepSeek)
- **Type-Safe Development** - Full TypeScript support

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend Framework** | React 19.2.1 |
| **Build Tool** | Vite 6.2.0 |
| **Language** | TypeScript 5.8.2 |
| **Styling** | Tailwind CSS 4.1.18 |
| **UI Components** | Material Web 2.4.1, Lucide Icons |
| **Animations** | Framer Motion 12.29.0, GSAP 3.14.2 |
| **Export** | jsPDF 4.0.0 |
| **AI Integration** | OpenAI 6.16.0 |
| **Package Manager** | npm/pnpm |
| **Node Version** | 16+ recommended |

## 📦 Installation

### Prerequisites
- **Node.js** 16.x or higher (18+ recommended)
- **npm** 8.x or higher (or pnpm/yarn)
- **Git** for version control
- API Key for AI service (Gemini or DeepSeek)

### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/DocSynapse/Referralink.git
cd Referralink

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Add your API credentials to .env.local
# Edit .env.local and set:
# - VITE_GEMINI_API_KEY (for Gemini API)
# - Or configure DeepSeek endpoint as needed

# 5. Start the development server
npm run dev

# The application will be available at http://localhost:5173
```

### Build for Production

```bash
# Build the project
npm run build

# Preview the production build locally
npm run preview

# The built files will be in the 'dist/' directory
```

## 🎮 Usage

### Running Locally

```bash
# Development mode with hot reload
npm run dev

# Visit http://localhost:5173 in your browser
```

### Basic Workflow

1. **Access the Application** - Open the app in your web browser
2. **Input Referral Data** - Add referral information through the UI
3. **Analyze with AI** - Use AI features to get insights on your data
4. **Export Results** - Generate PDF reports of your analysis
5. **Track Metrics** - Monitor key referral metrics in real-time

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# DeepSeek Configuration (optional)
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1

# Other configurations
VITE_API_TIMEOUT=30000
```

## 🏗️ Project Structure

```
Referralink/
├── src/
│   ├── components/          # Reusable React components
│   ├── services/            # API and business logic services
│   ├── lib/                 # Utility functions and helpers
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # React entry point
│   ├── index.css            # Global styles
│   ├── constants.ts         # Application constants
│   └── types.ts             # TypeScript type definitions
├── public/                  # Static assets
├── docs/                    # Documentation files
├── .github/                 # GitHub configuration
│   ├── workflows/           # CI/CD pipelines
│   └── ISSUE_TEMPLATE/      # Issue templates
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Project metadata and dependencies
├── README.md                # Project documentation
├── CHANGELOG.md             # Version history
├── CONTRIBUTING.md          # Contribution guidelines
├── SECURITY.md              # Security policy
├── CODE_OF_CONDUCT.md       # Community code of conduct
└── LICENSE                  # MIT License

```

## 🧪 Testing & Quality

### Running Tests
```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Code Quality
```bash
# Type checking
npx tsc --noEmit

# Linting (when configured)
npm run lint

# Format code (when configured)
npm run format
```

## 📚 Documentation

For more detailed information, see:

- **[API Documentation](docs/API.md)** - API endpoints and integration guide
- **[Development Guide](docs/DEVELOPMENT.md)** - Development setup and architecture
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[GEMINI Configuration](GEMINI.md)** - Gemini API specific setup

## 🚀 Deployment

### Deployment Options

1. **Vercel** (Recommended for Vite)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Docker**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "run", "preview"]
   ```

4. **Traditional Server**
   ```bash
   npm run build
   # Upload 'dist' folder to your server
   ```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- How to report bugs
- How to suggest enhancements
- How to submit pull requests
- Code style and standards
- Commit message conventions

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m "feat: add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 🔒 Security

For security vulnerabilities, please refer to [SECURITY.md](SECURITY.md).

**Do not** open public issues for security vulnerabilities. Instead, please email security concerns to the maintainers.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes in each release.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **Issues** - Report bugs or suggest features via [GitHub Issues](https://github.com/DocSynapse/Referralink/issues)
- **Discussions** - Join community discussions for questions and ideas
- **Email** - Contact maintainers: [support@example.com]

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Bundled with [Vite](https://vitejs.dev/)
- AI powered by [Gemini](https://ai.google.dev/) and [DeepSeek](https://www.deepseek.com/)
- Icons from [Lucide React](https://lucide.dev/)

## 📊 Project Status

- **Current Version**: 0.1.0 (Beta)
- **Status**: Active Development
- **Last Updated**: January 2025

---

<div align="center">

**[⬆ back to top](#referralink---ai-powered-referral-system)**

Made with ❤️ by the Referralink Team

</div>
