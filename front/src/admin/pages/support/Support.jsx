import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets, updateTicket } from '../../../redux/slice/support.slice';
import { MdEmail, MdCheckCircle, MdCancel } from 'react-icons/md';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const Support = () => {
    const dispatch = useDispatch();
    const { tickets, loading } = useSelector(state => state.support);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [response, setResponse] = useState('');

    useEffect(() => {
        dispatch(fetchTickets());
    }, [dispatch]);

    const handleCloseTicket = () => {
        dispatch(updateTicket({ id: selectedTicket._id, status: 'Closed', adminResponse: response }))
            .then(() => {
                setSelectedTicket(null);
                setResponse('');
            });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Customer Support</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets && tickets.length > 0 ? (
                    tickets.map(ticket => (
                        <div key={ticket._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><MdEmail /></div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{ticket.subject}</h3>
                                        <p className="text-xs text-gray-500">{ticket.email}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 flex-grow">{ticket.message}</p>
                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                                {ticket.status === 'Open' && (
                                    <button
                                        onClick={() => setSelectedTicket(ticket)}
                                        className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition"
                                    >
                                        Reply & Close
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500 p-8 bg-white rounded-lg border">No support tickets found.</div>
                )}
            </div>

            <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Reply to {selectedTicket?.email}</DialogTitle>
                <DialogContent>
                    <div className="mb-4 bg-gray-50 p-3 rounded text-sm text-gray-600">
                        <p className="font-bold mb-1">User Message:</p>
                        {selectedTicket?.message}
                    </div>
                    <textarea
                        className="w-full border p-2 rounded h-32"
                        placeholder="Type your response here..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                    ></textarea>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedTicket(null)}>Cancel</Button>
                    <Button onClick={handleCloseTicket} variant="contained">Send Reply & Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Support;
