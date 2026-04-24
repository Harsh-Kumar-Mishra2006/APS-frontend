import React from 'react'

const List = (d) => {
  const {id, name, age, email, course, semester, gpa} = d.student;
  return(
            <div key={id} className="mb-2 p-2 border rounded">
            <h4 className="font-bold">{name}</h4>
            <h4 className="font-bold">{age}</h4>
            <h4 className="font-bold">{email}</h4>
            <h4 className="font-bold">{course}</h4>
            <h4 className="font-bold">{semester}</h4>
            <h4 className="font-bold">{gpa}</h4>
            </div>
          );
}

export default List;
