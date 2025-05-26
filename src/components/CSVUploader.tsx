import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CSVUploaderProps {
  onUpload: (data: string[][]) => void;
  acceptedTypes?: string;
  description?: string;
  uploadType: 'participants' | 'teams';
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ 
  onUpload, 
  acceptedTypes = '.csv', 
  description = 'Upload a CSV file',
  uploadType
}) => {
  const { toast } = useToast();

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n');
    const result: string[][] = [];
    
    for (let line of lines) {
      if (line.trim()) {
        // Parse each line into an array with a single USN
        const usn = line.trim().replace(/"/g, '');
        if (usn) {
          result.push([usn]);
        }
      }
    }
    
    return result;
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          toast({
            title: "Empty file",
            description: "The CSV file appears to be empty.",
            variant: "destructive",
          });
          return;
        }

        // Upload to MongoDB through API
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: uploadType,
            data: data
          }),
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        
        // Call the original onUpload callback
        onUpload(data);
        
        toast({
          title: "File uploaded successfully",
          description: result.message,
        });
      } catch (error) {
        toast({
          title: "Error uploading file",
          description: "Please check your CSV format and try again.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    // Clear the input
    event.target.value = '';
  }, [onUpload, toast, uploadType]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="csv-upload" className="block text-sm font-medium mb-2">
          {description}
        </Label>
        <Input
          id="csv-upload"
          type="file"
          accept={acceptedTypes}
          onChange={handleFileUpload}
          className="cursor-pointer"
        />
      </div>
      
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">CSV Format Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>One USN per line</li>
              <li>No headers required</li>
              <li>UTF-8 encoding recommended</li>
              <li>Example format:</li>
              <li className="ml-4 font-mono">1MS22CS038</li>
              <li className="ml-4 font-mono">1MS22CS039</li>
              <li className="ml-4 font-mono">1MS22CS037</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVUploader;
