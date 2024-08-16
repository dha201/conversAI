import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from "@/app/components/ui/use-toast";
import { text } from 'stream/consumers';

interface CreateFlashcardProps {
    deckName: string ; 
    userId: string;
}

const CreateFlashcard = ({ deckName, userId }: CreateFlashcardProps) => {
    const [selectedInput, setSelectedInput] = useState<'link' | 'document' | 'text'>('link');
    const [file, setFile] = useState<File | null>(null);
    const [textInput, setTextInput] = useState<string>('');
    const [linkInput, setLinkInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleInputTypeClick = (type: 'link' | 'document' | 'text') => {
        setSelectedInput(type);
    };

    /**
     * Handle filtering of input type and call the appropriate function to generate content
     */
    const handleGenerateContent = () => {
        if (selectedInput === 'document' && file) {
            handleGenerateKeywords(file, deckName, userId);
        } else if (selectedInput === 'text') {
            console.log('Text Input:', textInput && textInput);
            handleUpload(textInput);
            handleGenerateKeywords(textInput, deckName, userId);
        } else if (selectedInput === 'link') {
            handleGenerateKeywords(selectedInput, deckName, userId);
        }
    };

    /**
     * Need better name for this function
     * 
     * Generate keywords from user's provided content
     * Use the list of keywords to retrieve relevant information from the knowledge base.
     * Pass in context to OpenAI to generate a list of flashcard questions and answers.
     * Store it in the mongoDB for later retrieval. 
     */
    const handleGenerateKeywords = async (input: File | string, deckName: string, userId: string) => {
        const formData = new FormData();
    
        if (input instanceof File) {
            formData.append('pdf', input);
        } else {
            formData.append('text', input);
        }
    
        formData.append('deckName', deckName);
        formData.append('userId', userId);

        try {
            const response = await fetch('/api/generateKeywords', {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                toast({
                    title: "Keywords Generated",
                    description: "Keywords generated from the provided content.",
                    variant: "default",
                });
            } else {
                throw new Error("Failed to generate keywords");
            }
        } catch (error) {
            console.error('Error generating keywords:', error);
            toast({
                title: "Keyword Generation Failed",
                description: "There was an error generating keywords from your content.",
                variant: "destructive",
            });
        }
    };
    
    const handleLinkSubmit = () => {
        console.log('Link Input:', linkInput);
        // Handle link submission logic here
    };

    /**
     * Embeds the provided content into the knowledge base (Pinecone)
     */
    const handleUpload = async (input: string | File) => {
        setIsLoading(true);
        const formData = new FormData();
        let endpoint = '/api/embed-pdf';
        
        if (typeof input === 'string') {
            formData.append('content', input);
        } else if (input instanceof File) {
            formData.append('pdf', input);
        } else {
            throw new Error("Invalid input type");
        }
    
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                console.log('Content uploaded and embedded successfully');
    
                /* if (input instanceof File) {
                    // Make the second API call to generate keywords only for PDF files
                    const keywordResponse = await fetch('/api/generateKeywords', {
                        method: 'POST',
                        body: formData,
                    });
                } */
    
                toast({
                    title: "Upload Successful",
                    description: typeof input === 'string' 
                        ? "Knowledge base updated with the provided text."
                        : "Knowledge base updated. The AI is now equipped to handle queries about your uploaded document.",
                    variant: "default",
                });

            } else {
                throw new Error("Failed to upload content");
            }
        } catch (error) {
            console.error('Error uploading and embedding content:', error);
            toast({
                title: "Upload Failed",
                description: "There was an error uploading your content.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Only For File Upload: Automatically call handleUpload once a file is selected
     */
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
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
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
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="w-4/5 p-2 mr-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    )}

                    <button 
                        onClick={handleGenerateContent}
                        className="px-4 py-2 text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-700">
                        Generate Content
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateFlashcard;
