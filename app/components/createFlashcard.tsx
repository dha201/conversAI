import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from "@/app/components/ui/use-toast";

const CreateFlashcard = () => {
    const [selectedInput, setSelectedInput] = useState<'link' | 'document' | 'text'>('link');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleInputTypeClick = (type: 'link' | 'document' | 'text') => {
        setSelectedInput(type);
    };

    const handleUpload = async (file: File) => {
        if (file) {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('pdf', file);

            try {
                const response = await fetch('/api/embed-pdf', {
                    method: 'POST',
                    body: formData,
                });
            
                if (response.ok) {
                    console.log('PDF uploaded and embedded successfully');
                    // You can add additional logic here, like updating the chat context
                    toast({
                        title: "Upload Successful",
                        description: "Knowledge base updated. The AI is now equipped to handle queries about your uploaded document.",
                        variant: "default",
                    });
                }
            } catch (error) {
                console.error('Error uploading and embedding PDF:', error);
                toast({
                    title: "Upload Failed",
                    description: "There was an error uploading your PDF.",
                    variant: "destructive",
                });
            } finally {
            setIsLoading(false);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          setFile(e.target.files[0]);
          handleUpload(e.target.files[0]);
        }
    };

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full p-6 overflow-y-auto flex-grow flex flex-col gap-4 items-center justify-center bg-slate-50">
            <div className="w-11/12 max-w-2xl p-8 bg-white rounded-lg shadow-lg">
                {/* Recreate the stepper for create -> type-choice https://primereact.org/stepper/ */}
                <div className="flex justify-around mb-8">
                <button className="px-4 py-2 text-lg font-medium bg-gray-200 rounded hover:bg-gray-300">
                    Create
                </button>
                <button className="px-4 py-2 text-lg font-medium bg-gray-200 rounded hover:bg-gray-300">
                    Source
                </button>
                </div>

                <p className="mb-8 text-sm text-gray-600">
                The security and confidentiality of your data is our priority and we guarantee that no AI model will be trained with your data.
                </p>

                <div className="flex justify-around mb-8">
                    <div 
                        className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer ${selectedInput === 'link' ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500`}
                        onClick={() => handleInputTypeClick('link')}
                    >
                        {/* <Image src="/link-icon.png" alt="Link" width={50} height={50} /> */}
                        <span className="mt-2">Link</span>
                    </div>

                    {/* https://primereact.org/fileupload/ */}
                    <div 
                        className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer ${selectedInput === 'document' ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500`}
                        onClick={() => handleInputTypeClick('document')}
                    >
                        {/* <Image src="/document-icon.png" alt="Document" width={50} height={50} /> */}
                        <span className="mt-2">Document</span>
                    </div>
                    
                    <div 
                        className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer ${selectedInput === 'text' ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500`}
                        onClick={() => handleInputTypeClick('text')}
                    >
                        {/* <Image src="/text-icon.png" alt="Text" width={50} height={50} /> */}
                        <span className="mt-2">Text</span>
                    </div>

                </div>

                <div className="flex items-center justify-center">
                    {selectedInput === 'link' && (
                        <input
                        type="text"
                        placeholder="https://www.conversAI.com"
                        className="w-4/5 p-2 mr-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    )}

                    {selectedInput === 'document' && (
                        <button
                        onClick={handleIconClick}
                        className="p-2 hover:bg-gray-100 rounded-full"
                        disabled={isLoading}
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                            />
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
                                </svg>
                            )}
                        </button>
                    )}

                    {selectedInput === 'text' && (
                        <textarea
                        placeholder="Enter your text here"
                        className="w-4/5 p-2 mr-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    )}

                    <button className="px-4 py-2 text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-700">
                        Generate Content
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateFlashcard;
