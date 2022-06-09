import React, { useEffect, useState } from 'react'
import axios from "axios";

function Fib() {
    const [state, setState] = useState({
        seenIndexes: [],
        values: {},
        index: ""
    })

    const fetchValues = async () => {
        const values = await axios.get('/api/values/current');
        setState(prev => ({ ...prev, values: values.data }));
    }
    const fetchIndexes = async () => {
        const seenIndexes = await axios.get('/api/values/all');
        setState(prev => ({ ...prev, seenIndexes: seenIndexes.data }))
    }
    // Fetch data
    useEffect(() => {
        fetchValues();
        fetchIndexes();
    }, []);

    // Form handler
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Post request
        await axios.post('/api/values', {
            index: state.index
        });

        // Clear the value
        setState(prev => ({ ...prev, index: '' }));
    }

    // Render
    const renderSeenIndexes = () => {
        return state.seenIndexes.length > 0 && state.seenIndexes.map(({ number }) => number).join(', ');
    }

    const renderValues = () => {
        const entries = [];

        for (let key in state.values) {
            // Push into entries
            entries.push(
                <div key={key}>
                    For index {key} I calculated {state.values[key]}
                </div>
            )
        }

        return entries;
    }

    // Return jsx
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Enter your index</label>
                <input value={state.index}
                    onChange={event => setState(prev => ({ ...prev, index: event.target.value }))} />
                <button>Submit</button>
            </form>

            <h3>Indexes I have seen: </h3>
            {renderSeenIndexes()}

            <h3>Calculated Values:</h3>
            {renderValues()}
        </div>
    )
}

export default Fib