import axios from "axios";

// Debug environment variables
console.log('🔍 Environment Debug:');
console.log('- import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- import.meta.env.MODE:', import.meta.env.MODE);
console.log('- import.meta.env.DEV:', import.meta.env.DEV);

// Force localhost for development with explicit fallback
const envApiUrl = import.meta.env.VITE_API_URL;
let API_BASE_URL;

if (envApiUrl && envApiUrl.includes('localhost')) {
    API_BASE_URL = envApiUrl;
    console.log('✅ Using environment localhost URL:', API_BASE_URL);
} else if (envApiUrl && !envApiUrl.includes('localhost')) {
    console.warn('⚠️ Environment points to external server:', envApiUrl);
    console.warn('🔧 Forcing localhost for local development');
    API_BASE_URL = "http://localhost:8000";
} else {
    console.log('🔧 No VITE_API_URL found, using localhost fallback');
    API_BASE_URL = "http://localhost:8000";
}

console.log('🎯 Final API_BASE_URL:', API_BASE_URL);

// Export the URL
export { API_BASE_URL };

export const postData = async (url, formData) => {
    try {
        const response = await fetch(API_BASE_URL + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },

            body: JSON.stringify(formData)
        });


        if (response.ok) {
            const data = await response.json();
            //console.log(data)
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
        return { error: true, message: 'Network error occurred' };
    }

}



export const getData = async (url) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 

        const { data } = await axios.get(API_BASE_URL + url,params)
        return data;
    } catch (error) {
        console.log(error);
        return { error: true, message: 'Network error occurred' };
    }
}

// Alias for backward compatibility
export const fetchDataFromApi = getData;


export const uploadImage = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'multipart/form-data', // Adjust the content type as needed
          },
    
    } 

    var response;
    await axios.put(API_BASE_URL + url,updatedData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}




export const editData = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 

    var response;
    await axios.put(API_BASE_URL + url,updatedData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}


export const deleteData = async (url ) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 
        const { data } = await axios.delete(API_BASE_URL + url, params)
        return data;
    } catch (error) {
        console.error('Delete error:', error);
        return { error: true, message: 'Network error occurred' };
    }
}