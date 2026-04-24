import React,{useState} from 'react';
import {studentsData} from './data';
import List from './List';
import Form from './FormState';
import Test from './context/test';
// This component demonstrates various prop concepts:
// 1. Basic props (name, age, email)
// 2. Default props
// 3. Prop types concept (commented)
// 4. Children prop
// 5. Function props (callback)
// 6. Conditional rendering based on props

const UserCard = ({ 
  name, 
  age, 
  email, 
  isActive, 
  role = 'User', // Default prop value
  onStatusChange, // Function prop
  children // Children prop for composition
}) => {
  
  // Function to handle button click and pass data back to parent
  const handleToggleStatus = () => {
    if (onStatusChange) {
      onStatusChange(!isActive);
    }
  };

  const [button, setButton] = useState(0);

  const handleButtonClick = () => {
    setButton(button + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header with conditional styling based on props */}
      <div className={`p-4 ${isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{name}</h2>
          <span className="px-2 py-1 text-sm rounded-full bg-white bg-opacity-20">
            {role}
          </span>
        </div>
      </div>
      
      {/* Body with prop values */}
      <div className="p-4 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">Age:</span>
          <span className="text-gray-600">{age}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">Email:</span>
          <span className="text-gray-600">{email}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {/* Children prop - allows nested content */}
        {children && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {children}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with action button that uses function prop */}
      <div className="p-4 bg-gray-50">
        <button
          onClick={handleToggleStatus}
          className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Toggle Status
        </button>
      </div>

      
      <button className=' align-middle rounded-xl h-20 w-50 bg-indigo-400 text-black shadow-lg' 
      onClick={handleButtonClick}>
      Clicked me , {button} times 
      </button>
      <Form/>
      <Test/>


      <div className="p-4 bg-gray-50">
        {studentsData.map((student)=>(
          <List key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
};

// Default props - values used when props are not provided
UserCard.defaultProps = {
  age: 'Not provided',
  email: 'No email provided',
  isActive: false
};

export default UserCard;