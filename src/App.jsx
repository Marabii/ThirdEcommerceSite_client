import { lazy, Suspense, useState, useEffect, createContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UseAuthCheck from './utils/verifyUser'
import ErrorFallback from './pages/ErrorFallback/ErrorFallback'
import useSetUpCartItems from './utils/useSetUpCartItems'

const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage'))
const About = lazy(() => import('./pages/About/About'))
const Login = lazy(() => import('./pages/Login/Login'))
const Register = lazy(() => import('./pages/Register/Register'))
const Admin = lazy(() => import('./pages/Admin/Admin'))
const ProductPage = lazy(() => import('./pages/Product/ProductPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage/CheckoutPage'))
const SuccessfulPayment = lazy(
  () => import('./pages/PaymentStatus/SuccessfulPayment')
)
const Contact = lazy(() => import('./pages/Contact/Contact'))
const Shop = lazy(() => import('./pages/Shop/Shop'))
const Test = lazy(() => import('./pages/testPage/page'))

export const globalContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  cartItems: [],
  setCartItems: () => {},
  userData: {},
  setUserData: () => {},
  exploreAll: {}
})

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [userData, setUserData] = useState({})
  const [exploreAll, setExploreAll] = useState({})

  UseAuthCheck({
    interval: 10 * 60 * 1000,
    setIsLoggedIn: setIsLoggedIn,
    setUserData: setUserData,
    setExploreAll: setExploreAll
  })

  useSetUpCartItems(cartItems, setCartItems)

  return (
    <globalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        cartItems,
        setCartItems,
        userData,
        setUserData,
        exploreAll
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <LandingPage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <About />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Register />
              </Suspense>
            }
          />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Admin />
              </Suspense>
            }
          />
          <Route
            path="/product-page/:id"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ProductPage />
              </Suspense>
            }
          />
          <Route
            path="/checkout"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <CheckoutPage />
              </Suspense>
            }
          />
          <Route
            path="/successful-payment/:id"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <SuccessfulPayment />
              </Suspense>
            }
          />
          <Route
            path="/error-page"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ErrorFallback />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Contact />
              </Suspense>
            }
          />
          <Route
            path="/shop"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Shop />
              </Suspense>
            }
          />
          <Route
            path="/test"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Test />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ErrorFallback error={{ message: 'Page Not Found' }} />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </globalContext.Provider>
  )
}

export default App
