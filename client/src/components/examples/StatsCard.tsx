import StatsCard from '../StatsCard'
import { Users } from 'lucide-react'

export default function StatsCardExample() {
  return (
    <StatsCard 
      title="Total Employees" 
      value="245" 
      icon={Users}
      description="Active employees"
      trend={{ value: "12% from last month", positive: true }}
    />
  )
}
