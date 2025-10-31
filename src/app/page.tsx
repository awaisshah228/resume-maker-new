import Link from "next/link";
import { FileText, Sparkles, Target, Download, Zap, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 shrink-0" />
              <span className="text-base sm:text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                ResumeMaker.Online
              </span>
            </div>
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/editor"
                className="px-3 py-1.5 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Create Resume</span>
                <span className="sm:hidden">Create</span>
              </Link>
              <Link
                href="/grapes-editor"
                className="px-3 py-1.5 sm:px-6 sm:py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Advanced Builder</span>
                <span className="sm:hidden">Advanced</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-block">
              <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                ✨ Free Resume Maker Online
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              The <span className="text-blue-600">Easiest Way</span> to Build the Perfect Resume 📝✨
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
              Make your resume stand out with our incredibly easy-to-use Resume Maker. 
              Turn hours of work into minutes with AI – less typing, more applying!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/editor"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-all hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Resume
              </Link>
              <Link
                href="/grapes-editor"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-purple-700 transition-all hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Create Resume with Advanced Builder</span>
                <span className="sm:hidden">Advanced Builder</span>
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              No Sign-Up Required • 100% Free
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2 text-xs sm:text-sm text-gray-600">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
              </div>
              <span className="text-center sm:text-left">⭐⭐⭐⭐⭐ 4.8 - Loved by thousands</span>
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200">
              <div className="space-y-3 sm:space-y-4">
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-16 sm:h-20 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg"></div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="h-1.5 sm:h-2 bg-gray-200 rounded"></div>
                  <div className="h-1.5 sm:h-2 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-1.5 sm:h-2 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  <div className="h-6 sm:h-8 bg-blue-100 rounded-full w-16 sm:w-20"></div>
                  <div className="h-6 sm:h-8 bg-purple-100 rounded-full w-20 sm:w-24"></div>
                  <div className="h-6 sm:h-8 bg-pink-100 rounded-full w-12 sm:w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
              FEATURES
            </span>
            <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold px-4">
              Resume Building at <br className="hidden sm:inline" />
              <span className="text-blue-600">Lightning Speed</span> with AI ⚡
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 px-4">
              Discover how our AI-powered features help you build your resume in just minutes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">AI Writing Assistant</h3>
              <p className="text-sm sm:text-base text-gray-600">
                AI at your fingertips: improve, rewrite, shorten, or expand any section with one click. Instant polish, no guesswork.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">AI Bullet Point Generator</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Just enter your job title and get a curated list of high-impact bullet points you can pick and apply instantly.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">AI Summary & Skills Generator</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Type your role and choose from tailored summaries and hard skills—perfectly phrased and ready to drop into your resume.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Real-Time Editing</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Edit your resume directly in the preview. See changes instantly with inline editing, drag-and-drop, and formatting tools.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Download as PDF</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Export your professional resume as a high-quality PDF with perfect formatting, ready to send to employers.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Multiple Layouts</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Choose from Split, Classic, or Hybrid layouts. Customize colors, fonts, and move sections to create your perfect design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Ready to Create Your Perfect Resume?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Join thousands of job seekers who have built their dream resumes with our free tool
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/editor"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-all hover:shadow-xl"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Resume
            </Link>
            <Link
              href="/grapes-editor"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-purple-700 transition-all hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Create Resume with Advanced Builder</span>
              <span className="sm:hidden">Advanced Builder</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-lg font-bold">ResumeMaker.Online</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2025 ResumeMaker.Online. Build your dream resume today.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
