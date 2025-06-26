// Proxy serverless para evitar problemas de CORS
export async function GET(request: Request) {
  // Obtener parámetros de query desde la URL
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  const authToken = url.searchParams.get('token');
  
  if (!targetUrl) {
    return new Response(JSON.stringify({ 
      error: 'Missing URL parameter' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  try {
    // Construir headers
    const headers: HeadersInit = {
      'Accept': '*/*',
    };
    
    // Agregar token de autorización si existe
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Hacer la solicitud al servidor destino
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });
    
    // Obtener el cuerpo de la respuesta
    const data = await response.text();
    
    // Devolver la respuesta con los headers adecuados
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch from target URL',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Manejar solicitudes OPTIONS para CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}