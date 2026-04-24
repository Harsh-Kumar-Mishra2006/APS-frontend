import React, { useState } from 'react';
import UserCard from './UserCard';

// Main App component demonstrating various ways to pass props
function App() {
  // State to demonstrate dynamic prop changes
  const [userStatus, setUserStatus] = useState(true);
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', age: 28, email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com', role: 'Editor' },
    { id: 3, name: 'Bob Johnson', age: 24, email: 'bob@example.com', role: 'Viewer' }
  ]);

  // Function to be passed as prop
  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: newStatus } : user
    ));
  };

  // Demonstrating prop drilling with nested data
  const additionalInfo = (
    <div>
      <p className="text-xs">✨ Premium Member</p>
      <p className="text-xs">📅 Joined: Jan 2024</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with static props example */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            React Props Demonstration
          </h1>
          <p className="text-gray-600">
            Understanding props: data passing, functions, children, and default values
          </p>
        </div>

        {/* Grid layout for user cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <UserCard
              key={user.id}
              // Basic props - passing data
              name={user.name}
              age={user.age}
              email={user.email}
              // Boolean prop for conditional rendering
              isActive={userStatus}
              // String prop with default value fallback
              role={user.role}
              // Function prop for child-to-parent communication
              onStatusChange={(newStatus) => handleStatusChange(user.id, newStatus)}
            >
              {/* Children prop - passing JSX content */}
              {additionalInfo}
            </UserCard>
          ))}
        </div>

        {/* Demo section showing prop concepts */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📚 Important Props Concepts Explained
          </h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800">1. Passing Data (Basic Props)</h3>
              <p className="text-gray-600">Data passed from parent to child: name, age, email, role</p>
              <code className="text-sm bg-gray-100 p-1 rounded">name="John Doe" age={28}</code>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-800">2. Default Props</h3>
              <p className="text-gray-600">Fallback values when props aren't provided</p>
              <code className="text-sm bg-gray-100 p-1 rounded">UserCard.defaultProps = {{ age: 'Not provided' }}</code>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-800">3. Children Prop</h3>
              <p className="text-gray-600">Passing nested content/components between tags</p>
              <code className="text-sm bg-gray-100 p-1 rounded">{'<UserCard>...children...</UserCard>'}</code>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-gray-800">4. Function Props (Callbacks)</h3>
              <p className="text-gray-600">Passing functions for child-to-parent communication</p>
              <code className="text-sm bg-gray-100 p-1 rounded">onStatusChange={{'(newStatus) => handleChange()'}}</code>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-800">5. Conditional Rendering with Props</h3>
              <p className="text-gray-600">Using props to conditionally render elements</p>
              <code className="text-sm bg-gray-100 p-1 rounded">isActive ? 'Active' : 'Inactive'</code>
            </div>
          </div>
        </div>

        {/* Interactive demo */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="font-semibold text-gray-800 mb-2">🎮 Interactive Demo</h3>
          <p className="text-sm text-gray-600 mb-3">
            Click "Toggle Status" on any card to see how function props communicate between components
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setUserStatus(!userStatus)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Toggle All Users: {userStatus ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;