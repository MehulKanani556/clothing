import React from 'react';
import { MdLink, MdClose } from 'react-icons/md';
import { Modal, Box } from '@mui/material';

const LinkModal = ({
    isOpen,
    onClose,
    selectedText,
    linkUrl,
    setLinkUrl,
    onApplyLink,
    onRemoveLink
}) => {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="link-modal-title"
            aria-describedby="link-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: '500px' },
                    bgcolor: 'background.paper',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    outline: 'none',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <MdLink size={24} className="text-blue-600" />
                        <h2 id="link-modal-title" className="text-lg font-semibold text-gray-900">
                            {linkUrl ? 'Edit Link' : 'Add Link'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <MdClose size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5" id="link-modal-description">
                    {selectedText && (
                        <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Selected Text
                            </p>
                            <p className="text-sm text-gray-900 font-medium">
                                "{selectedText}"
                            </p>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="link-url"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            URL
                        </label>
                        <input
                            id="link-url"
                            type="url"
                            autoFocus
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && linkUrl.trim()) {
                                    onApplyLink();
                                } else if (e.key === 'Escape') {
                                    onClose();
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 gap-3">
                    {linkUrl ? (
                        <button
                            onClick={onRemoveLink}
                            className="px-4 py-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Remove Link
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onApplyLink}
                            disabled={!linkUrl.trim()}
                            className="px-6 py-2 text-sm font-bold text-black bg-[#FFE590] rounded-lg shadow-sm hover:bg-[#ffd966] hover:shadow-md transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            Apply Link
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default LinkModal;
