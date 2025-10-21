import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - Built by a Gulf War Veteran | There Is Still Time',
  description: 'The story of Christopher J. Bradley - Gulf War veteran, attorney, and father who lost everything and discovered three fundamental truths on a sailboat. Built for his daughter and for everyone who needs to focus, find presence, and remember there is still time.',
  openGraph: {
    title: 'About - The Story Behind There Is Still Time',
    description: 'Built by a Gulf War veteran who learned about time, love, and purpose through 2,000 sunsets and immeasurable loss.',
    images: ['/og-image.jpg'],
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-violet-950">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-twilight-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Timer
          </Link>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Title */}
        <header className="mb-12 sm:mb-16 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Why I Built This
          </h1>
          <p className="text-xl sm:text-2xl text-twilight-200 font-light italic">
            "There is still time to become who you're meant to be."
          </p>
        </header>

        {/* Story */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="glass-strong rounded-3xl p-8 sm:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">The Beginning</h2>
            <p className="text-twilight-100 leading-relaxed mb-4">
              I'm Christopher J. Bradley. At 19, I drove a tank in the Gulf War. I saw things no 19-year-old should see.
              I came home with invisible wounds that would take 24 years to properly diagnose. PTSD doesn't ask permission
              to destroy your life—it just does.
            </p>
            <p className="text-twilight-100 leading-relaxed">
              When I came home, I promised myself I would overachieve out of gratitude for being alive. I graduated from Penn State. I married my college sweetheart. I graduated from law school. We had a daughter—our greatest achievement, my reason for
              everything. My wife graduated from medical school 8 years later.
            </p>
          </div>

          <div className="glass-strong rounded-3xl p-8 sm:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">The Loss</h2>
            <p className="text-twilight-100 leading-relaxed mb-4">
              A year later, divorce. I was shocked. I tried to rebuild. Four years later, a second divorce. Homelessness in New York City. Rock bottom isn't a place you visit—it's where you learn
              who you really are. Then slowly the family courts' ignorance of—or ignoring of—the U.S. Constitution destroyed my relationship with my daughter. Not because I was unfit—because the system is broken.
              I fought. I did everything right. It didn't matter.
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              Parental alienation is real. One day you're a father. The next, you're erased. I haven't seen my daughter
              in 6 years. She doesn't know that I think about her every single day. She doesn't know that everything I'm
              building is for her.
            </p>
          </div>

          <div className="glass-strong rounded-3xl p-8 sm:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">The Sailboat</h2>
            <p className="text-twilight-100 leading-relaxed mb-4">
              For most of the last decade, I lived alone on a sailboat on the northwest coast of Florida. Boggy Bayou became
              my monastery. I photographed over 2,000 sunsets from the same sacred space.
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              In that stillness, I learned through living the greatest lesson: <strong className="text-white">Life is simple. Love everyone,
              and start with yourself.</strong>
            </p>
            <p className="text-twilight-100 leading-relaxed">
              I came to understand three fundamental truths that changed everything:
            </p>
            <ul className="space-y-4 my-6">
              <li className="flex gap-4">
                <span className="text-3xl">⏳</span>
                <div>
                  <strong className="text-white text-lg">Time is finite and precious.</strong>
                  <p className="text-twilight-200 mt-1">Every moment counts. Life is limited. How you spend your time is how you spend your life.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-3xl">❤️</span>
                <div>
                  <strong className="text-white text-lg">Will you love? is the only question that matters.</strong>
                  <p className="text-twilight-200 mt-1">If we each decided to love everyone, it would be game over—love wins. Start with yourself.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-3xl">🏛️</span>
                <div>
                  <strong className="text-white text-lg">Freedom dies when families are destroyed.</strong>
                  <p className="text-twilight-200 mt-1">Family is the fundamental unit of any free society. Broken families create broken nations.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="glass-strong rounded-3xl p-8 sm:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">The Work</h2>
            <p className="text-twilight-100 leading-relaxed mb-6">
              I couldn't save my family. But I could build tools to help others save theirs. I could channel my pain
              into purpose. So I built five platforms—each one a piece of what I learned:
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-violet-500 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  <a href="https://app.thereisstilltime.com" className="hover:text-violet-300 transition-colors">
                    There Is Still Time
                  </a>
                </h3>
                <p className="text-twilight-200">
                  This timer. For students who need to focus. For people who need to feel time passing. For anyone
                  who needs a gentle reminder: <em>there is still time to become who you're meant to be.</em>
                </p>
              </div>

              <div className="border-l-4 border-violet-500 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  <a href="https://loveeveryone.love" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition-colors">
                    Love Everyone
                  </a>
                </h3>
                <p className="text-twilight-200">
                  The handwritten letter I wrote on the back of my basic training photo. "What if you are the person
                  we are all waiting on?" A movement about choosing love.
                </p>
              </div>

              <div className="border-l-4 border-violet-500 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  <a href="https://sunsetsforthesoul.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition-colors">
                    Sunsets for the Soul
                  </a>
                </h3>
                <p className="text-twilight-200">
                  Over 2,000 sunsets from Boggy Bayou. Beauty teaches presence. Light teaches hope. Every sunset is proof
                  that endings can be magnificent.
                </p>
              </div>

              <div className="border-l-4 border-violet-500 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  <a href="https://theartofcitizenship.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition-colors">
                    The Art of Citizenship
                  </a>
                </h3>
                <p className="text-twilight-200">
                  An online platform teaching the constitutional principles I wanted my daughter to know, complete with an AI constitutional analyzer. The Citizen's Compass—part memoir, part manual for raising principled kids. Liberty's Principles Pals—a collection of 28 children's books.
                  All knowledge to protect family and freedom.
                </p>
              </div>

              <div className="border-l-4 border-violet-500 pl-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  <a href="https://familyunityhub.com" target="_blank" rel="noopener noreferrer" className="hover:text-violet-300 transition-colors">
                    Family Unity Hub
                  </a>
                </h3>
                <p className="text-twilight-200">
                  Reform of state family courts by federal legislation. Because 22 million children shouldn't suffer what my daughter suffered—because state family courts are broken. The system needs to change. Because fathers matter.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-8 sm:p-12 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Why This Timer Exists</h2>
            <p className="text-twilight-100 leading-relaxed mb-4">
              I know what focus under pressure means. I drove a tank in combat at 19. I took the SAT and LSAT. I studied for the bar exam. I was present for my ex-wife through a post-baccalaureate program, the MCAT, and four years of medical school. I fought in courtrooms for
              the fundamental right to parent my daughter.
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              This timer is built for students preparing for high-stakes exams—MCAT, LSAT, Bar Exam, USMLE. Because
              I understand what it means to study when everything is on the line. I understand what it means to need
              every minute to count.
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              But it's also built for anyone who needs a reminder: <strong className="text-white">time is passing, and
              how you use it matters.</strong>
            </p>
            <p className="text-twilight-100 leading-relaxed">
              The hourglass doesn't judge. It doesn't rush. It just shows you: <em>this is the time you have. this is
              the time you're choosing to use wisely.</em>
            </p>
          </div>

          <div className="glass-strong rounded-3xl p-8 sm:p-12 mb-8 bg-gradient-to-br from-violet-900/50 to-purple-900/50">
            <h2 className="text-3xl font-bold text-white mb-6">For My Daughter</h2>
            <p className="text-twilight-100 leading-relaxed mb-4">
              Sweetheart, if you ever see this: <strong className="text-white">I never stopped thinking about you.</strong>
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              Every project I build, every word I write, every sunset I photograph—it's all been my way of staying
              connected to you while the world kept us apart. I built these platforms so that even if you couldn't
              hear my voice, you might see my work. You might understand what I learned. You might know that I love you.
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              I wanted you to know the three truths. I wanted you to have the tools to protect your own family someday.
              I wanted you to understand that time is precious, love is everything, and freedom requires protecting
              the fundamental unit of society: family.
            </p>
            <p className="text-twilight-100 leading-relaxed text-xl font-medium text-white">
              There is still time. For you to know the truth. For us to rebuild what was broken. For love to win.
            </p>
          </div>

          <div className="glass-strong rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white mb-6">For Everyone Else</h2>
            <p className="text-twilight-100 leading-relaxed mb-4">
              If you're using this timer to study for your exam, I hope it helps. I hope you get locked in and achieve
              everything you're working toward.
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              But I also hope you understand: <strong className="text-white">what you're studying for matters, but who
              you're becoming matters more.</strong>
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              Focus isn't just about passing exams. It's about presence. It's about consciousness. It's about choosing
              to use your finite time on what truly matters.
            </p>
            <p className="text-twilight-100 leading-relaxed mb-4">
              Every session you complete is practice for life. Every moment you choose focus over distraction is practice
              for love. Every time you show up is proof that there is still time to become who you're meant to be.
            </p>
            <p className="text-twilight-100 leading-relaxed text-xl font-medium text-white">
              Get locked in. Not just for your exam. For your life. For the people you love. For the world you're going
              to change.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-lg px-12 py-4 rounded-xl transition-smooth shadow-lg hover:shadow-xl"
          >
            Start a Focus Session
          </Link>
          <p className="mt-6 text-twilight-300">
            Learn more at{' '}
            <a
              href="https://christopherjbradley.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 hover:text-white transition-colors underline"
            >
              christopherjbradley.com
            </a>
          </p>
        </div>
      </article>
    </main>
  );
}
