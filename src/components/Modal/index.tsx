import React from 'react';

interface FullscreenModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ visible, onClose, children }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-25 flex items-center justify-center">
            <div className="relative bg-white w-full h-fit max-w-full max-h-[calc(100vh-4rem)] m-4 rounded-lg overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <div className="p-4 flex justify-center items-center h-full max-h-[calc(100vh-4rem)] overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FullscreenModal;
