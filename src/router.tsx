import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import App from './App.tsx'

// Lazy: keeps react-markdown out of the main page's bundle.
const NotesPage = lazy(() => import('./notes/NotesPage.tsx'))
const PuppiesPage = lazy(() => import('./puppies/PuppiesPage.tsx'))

/**
 * HashRouter because GitHub Pages can't serve unknown paths -- a direct
 * load of /notes would 404. The route is /#/notes and stays
 * unlisted anywhere on the site.
 */
export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/notes"
          element={
            <Suspense>
              <NotesPage />
            </Suspense>
          }
        />
        <Route
          path="/puppies"
          element={
            <Suspense>
              <PuppiesPage />
            </Suspense>
          }
        />
      </Routes>
    </HashRouter>
  )
}
