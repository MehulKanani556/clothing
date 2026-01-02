import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOffers, createOffer } from '../../../redux/slice/offer.slice';
import { MdAdd, MdDelete, MdLocalOffer } from 'react-icons/md';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Mock Data for now as API hook wasn't created for Offers in this turn
const OfferSchema = Yup.object().shape({
    code: Yup.string().required('Required'),
    type: Yup.string().required('Required'),
    value: Yup.number().required('Required'),
    startDate: Yup.date().required('Required'),
    endDate: Yup.date().required('Required')
});

const OfferZone = () => {
    const dispatch = useDispatch();
    const { offers, loading } = useSelector(state => state.offers);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchOffers());
    }, [dispatch]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Offer Zone</h2>
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                >
                    <MdAdd /> Create Offer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-8">Loading offers...</div>
                ) : offers && offers.length > 0 ? (
                    offers.map(offer => (
                        <div key={offer._id || offer.id} className="relative bg-white p-6 rounded-xl shadow-sm border border-pink-100 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-pink-600">
                                <MdLocalOffer size={100} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">{offer.code}</h3>
                            <p className="text-pink-600 font-bold text-lg mt-1">
                                {offer.type === 'PERCENTAGE' ? `${offer.value}% OFF` : `₹${offer.value} FLAT OFF`}
                            </p>
                            <div className="mt-4 flex gap-2 text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded bg-green-50 text-green-700`}>{offer.isActive ? 'Active' : 'Inactive'}</span>
                                <span>Expires: {new Date(offer.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500">No offers found. Create one!</div>
                )}
            </div>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={{ code: '', type: 'PERCENTAGE', value: 0, startDate: '', endDate: '' }}
                        validationSchema={OfferSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            dispatch(createOffer(values)).then(() => {
                                setSubmitting(false);
                                setOpen(false);
                            });
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4 pt-4">
                                <div>
                                    <label className="block text-sm font-medium">Coupon Code</label>
                                    <Field name="code" className="w-full border p-2 rounded uppercase" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Type</label>
                                        <Field as="select" name="type" className="w-full border p-2 rounded">
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FLAT">Flat Amount (₹)</option>
                                        </Field>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Value</label>
                                        <Field name="value" type="number" className="w-full border p-2 rounded" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Start Date</label>
                                        <Field name="startDate" type="date" className="w-full border p-2 rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">End Date</label>
                                        <Field name="endDate" type="date" className="w-full border p-2 rounded" />
                                    </div>
                                </div>
                                <DialogActions>
                                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button type="submit" variant="contained" disabled={isSubmitting}>Create</Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OfferZone;
