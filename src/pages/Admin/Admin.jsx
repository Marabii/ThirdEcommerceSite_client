import useAdminAccess from '../../utils/useAdminAccess'
import SideBarAdmin from './AdminComponents/SideBar'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './AdminComponents/Dashboard'
import HandleProducts from './AdminComponents/HandleProducts'
import Orders from './AdminComponents/Orders'
import Header from '../../components/Header'

const Admin = () => {
  const { ToastContainer } = useAdminAccess()

  return (
    <>
      {/* Message for small screens */}
      <div className="flex h-screen items-center justify-center bg-red-100 p-5 xl:hidden">
        <div className="rounded-xl border border-red-400 bg-red-200 p-5 text-center text-red-700 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Admin Panel Unavailable</h2>
          <p className="text-lg">
            Access to the admin panel is restricted on small screen devices.
            Please use a device with a larger screen to manage the admin panel.
          </p>
        </div>
      </div>

      {/* Admin panel layout for larger screens */}
      <div className="hidden overflow-x-hidden xl:flex">
        <Header />
        <main className="mx-2 mt-[150px] flex w-full space-x-2 rounded-xl p-5">
          <SideBarAdmin />
          <div className="flex w-full bg-slate-100 p-5">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="ecommerce" element={<HandleProducts />} />
              <Route path="orders" element={<Orders />} />
            </Routes>
          </div>
        </main>
      </div>

      <ToastContainer />
    </>
  )
}

export default Admin
