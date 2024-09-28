import { useEffect, useState } from 'react'
import axiosInstance from '../../../utils/verifyJWT'

const OrdersTable = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch orders from the API
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/api/orders')
        setOrders(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return <div className="p-5 text-center">Loading orders...</div>
  }

  return (
    <div className="flex h-full w-full flex-wrap items-center justify-around gap-20 overflow-x-auto rounded-xl p-5">
      <h1 className="mb-4 text-2xl font-bold">All Orders</h1>
      <table className="min-w-full overflow-hidden rounded-lg bg-white shadow-md">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="w-1/4 px-4 py-3 text-left">Order ID</th>
            <th className="w-1/4 px-4 py-3 text-left">Customer</th>
            <th className="w-1/4 px-4 py-3 text-left">Country</th>
            <th className="w-1/4 px-4 py-3 text-left">Total Amount</th>
            <th className="w-1/4 px-4 py-3 text-left">Payment Date</th>
            <th className="w-1/4 px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr
              key={order._id}
              className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b`}
            >
              <td className="px-4 py-3">{order._id}</td>
              <td className="px-4 py-3">{order.fullName}</td>
              <td className="px-4 py-3">{order.country}</td>
              <td className="px-4 py-3">SAR {order.totalAmount.toFixed(2)}</td>
              <td className="px-4 py-3">
                {new Date(order.paymentDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    order.status === 'delivered'
                      ? 'bg-green-200 text-green-800'
                      : order.status === 'shipped'
                        ? 'bg-yellow-200 text-yellow-800'
                        : order.status === 'pending'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-red-200 text-red-800'
                  }`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersTable
