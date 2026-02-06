import { useState } from 'react'
import { Search, MoreVertical, Mail, Calendar } from 'lucide-react'

// Placeholder data
const customers = [
    { id: 1, name: 'Jane Doe', email: 'jane@example.com', orders: 5, totalSpent: 450.00, joinDate: '2024-01-15' },
    { id: 2, name: 'John Smith', email: 'john@example.com', orders: 3, totalSpent: 220.50, joinDate: '2024-02-10' },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', orders: 12, totalSpent: 1250.00, joinDate: '2023-11-05' },
    { id: 4, name: 'Bob Wilson', email: 'bob@example.com', orders: 1, totalSpent: 45.00, joinDate: '2024-03-20' },
    { id: 5, name: 'Emma Brown', email: 'emma@example.com', orders: 8, totalSpent: 780.25, joinDate: '2024-01-30' },
]

export function AdminCustomers() {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer base</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left p-4 font-medium text-sm">Customer</th>
                                <th className="text-left p-4 font-medium text-sm">Contact</th>
                                <th className="text-left p-4 font-medium text-sm">Orders</th>
                                <th className="text-left p-4 font-medium text-sm">Total Spent</th>
                                <th className="text-left p-4 font-medium text-sm">Join Date</th>
                                <th className="text-right p-4 font-medium text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-muted/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-sm">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <span>{customer.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">{customer.orders} orders</td>
                                    <td className="p-4 text-sm font-medium">${customer.totalSpent.toFixed(2)}</td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {customer.joinDate}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="btn-ghost p-2">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
