import React, { useState } from 'react';

function Form() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [sem, setSem] = useState('');
    const [cgpa, setCgpa] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
    };

    return (
        <div>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
            />
            <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
            />
            <input
                type="number"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="Enter your CGPA"
            />
            <input
                type="number"
                value={sem}
                onChange={(e) => setSem(e.target.value)}
                placeholder="Enter your semester"
            />
            <button onClick={handleSubmit}>Submit</button>
            {submitted && <p>Form Submitted!</p>}
        </div>
    );
}

export default Form;