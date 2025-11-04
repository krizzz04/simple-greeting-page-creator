import axios from "axios";

// API base URL: Always use production server
// To use localhost, set VITE_API_URL=http://localhost:8000 in your environment
const API_BASE_URL = "https://tara-g1nf.onrender.com";

console.log('🔗 API Base URL:', API_BASE_URL);

// Export the URL
export { API_BASE_URL };

export const postData = async (url, formData) => {
    try {
        const fullUrl = API_BASE_URL + url;
        console.log('📤 POST Request to:', fullUrl);
        
        const response = await fetch(fullUrl, {
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
        const fullUrl = API_BASE_URL + url;
        console.log('📥 GET Request to:', fullUrl);
        
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 

        const { data } = await axios.get(fullUrl,params)
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