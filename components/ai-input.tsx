import { useState, useRef, ChangeEvent, useEffect, KeyboardEvent } from 'react';

interface InputProps {
  onChange?: (text: string) => void;
  value?: string;
  onSubmit?: () => void; // Add this prop for form submission
}

const Input = ({ onChange, value = "", onSubmit }: InputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Calculate character count when input value changes
    setCharCount(inputValue.length);
  }, [inputValue]);

  // Sync with external value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Create a preview URL when a file is uploaded
  useEffect(() => {
    if (!uploadedFile) {
      setFilePreviewUrl(null);
      return;
    }

    // Create preview for image files
    if (uploadedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(uploadedFile);
      setFilePreviewUrl(url);
      
      // Clean up the URL when the component unmounts or when the file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    
    // For non-image files, we don't generate a preview URL
    setFilePreviewUrl(null);
  }, [uploadedFile]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Handle key press events
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift key
    if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault(); // Prevent new line
      onSubmit();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine file icon based on type
  const getFileIcon = () => {
    if (!uploadedFile) return null;
    
    // Get file extension
    const extension = uploadedFile.name.split('.').pop()?.toLowerCase();
    
    if (uploadedFile.type.startsWith('image/')) {
      return '📷';
    } else if (['pdf'].includes(extension || '')) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return '📊';
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return '📊';
    } else if (['zip', 'rar'].includes(extension || '')) {
      return '🗄️';
    } else {
      return '📎';
    }
  };

  return (
    <div className="w-full py-4">
      <div className="relative max-w-full w-full mx-auto">
        <div className="relative flex flex-col bg-black/5 border-white">
          <textarea 
            className="w-full min-h-[52px] max-h-[200px] rounded-xl rounded-b-none px-4 py-3 bg-black text-white placeholder:text-white/70 border-0 outline-none resize-none focus:ring-0 focus:outline-none leading-[1.2]" 
            placeholder="How can Instant Assignment help with this assignment?" 
            id="ai-input" 
            value={inputValue}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          
          {uploadedFile && (
            <div className="p-4 bg-black text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 truncate text-sm flex items-center">
                  <span className="mr-2 text-lg">{getFileIcon()}</span>
                  {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </div>
                <button 
                  onClick={removeFile}
                  className="text-white/60 hover:text-white/90 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {filePreviewUrl && uploadedFile.type.startsWith('image/') && (
                <div className="rounded overflow-hidden">
                  <img 
                    src={filePreviewUrl} 
                    alt={uploadedFile.name}
                    className="max-h-[150px] max-w-full object-contain bg-black/40 "
                  />
                </div>
              )}
              
              {!filePreviewUrl && (
                <div className="rounded border border-white/20 p-4 bg-black/40 flex items-center justify-center text-white/60">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getFileIcon()}</div>
                    <div className="text-xs">{uploadedFile.type || 'Unknown file type'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="h-12 bg-black rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <label className="cursor-pointer rounded-lg p-2 bg-white/5 hover:bg-white/10">
                <input 
                  className="hidden" 
                  type="file" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <svg className="text-white/40 hover:text-white transition-colors" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" height={16} width={16} xmlns="http://www.w3.org/2000/svg">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </label>
            </div>
            
            {/* Character count in bottom right */}
            <div className="absolute right-3 bottom-3 flex items-center">
              <span className="text-white/40 text-xs">{charCount} character{charCount !== 1 ? 's' : ''}</span>
              
              {/* Submit button */}
              <button 
                onClick={onSubmit}
                className="ml-2 rounded-lg p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white cursor-pointer transition-colors" 
                type="button"
              >

              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Input;