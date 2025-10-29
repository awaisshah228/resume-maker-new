import Link from "next/link";
import { FileText, Sparkles, Target, Download, Zap, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ResumeMaker.Online
              </span>
            </div>
            <Link
              href="/editor"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                ✨ Free Resume Maker Online
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              The <span className="text-blue-600">Easiest Way</span> to Build the Perfect Resume 📝✨
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Make your resume stand out with our incredibly easy-to-use Resume Maker. 
              Turn hours of work into minutes with AI – less typing, more applying!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/editor"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Create Resume
              </Link>
              <span className="text-sm text-gray-500 flex items-center justify-center">
                No Sign-Up Required
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
              </div>
              <span>⭐⭐⭐⭐⭐ 4.8 - Loved by thousands of users</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
              <div className="space-y-4">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-blue-100 rounded-full w-20"></div>
                  <div className="h-8 bg-purple-100 rounded-full w-24"></div>
                  <div className="h-8 bg-pink-100 rounded-full w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              FEATURES
            </span>
            <h2 className="mt-6 text-4xl font-bold">
              Resume Building at <br />
              <span className="text-blue-600">Lightning Speed</span> with AI ⚡
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Discover how our AI-powered features help you build your resume in just minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Writing Assistant</h3>
              <p className="text-gray-600">
                AI at your fingertips: improve, rewrite, shorten, or expand any section with one click. Instant polish, no guesswork.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Bullet Point Generator</h3>
              <p className="text-gray-600">
                Just enter your job title and get a curated list of high-impact bullet points you can pick and apply instantly.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Summary & Skills Generator</h3>
              <p className="text-gray-600">
                Type your role and choose from tailored summaries and hard skills—perfectly phrased and ready to drop into your resume.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Editing</h3>
              <p className="text-gray-600">
                Edit your resume directly in the preview. See changes instantly with inline editing, drag-and-drop, and formatting tools.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Download as PDF</h3>
              <p className="text-gray-600">
                Export your professional resume as a high-quality PDF with perfect formatting, ready to send to employers.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multiple Layouts</h3>
              <p className="text-gray-600">
                Choose from Split, Classic, or Hybrid layouts. Customize colors, fonts, and move sections to create your perfect design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Create Your Perfect Resume?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of job seekers who have built their dream resumes with our free tool
          </p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:shadow-xl"
          >
            <FileText className="w-5 h-5" />
            Start Building Now - It's Free!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <FileText className="w-6 h-6" />
              <span className="text-lg font-bold">ResumeMaker.Online</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 ResumeMaker.Online. Build your dream resume today.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
