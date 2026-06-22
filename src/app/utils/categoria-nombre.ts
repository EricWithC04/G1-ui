// Validacion compartida del nombre de categoria (mismas reglas que el backend).

export interface ResultadoValidacionCategoria {
  valido: boolean;
  mensaje?: string;
}

// Devuelve null si es valido, o un mensaje de error si no lo es.
export function validarNombreCategoria(nombre: string): string | null {
  const limpio = nombre.trim();

  if (!limpio) {
    return 'El nombre de la categoria es obligatorio.';
  }
  if (limpio.length < 2 || limpio.length > 50) {
    return 'El nombre debe tener entre 2 y 50 caracteres.';
  }
  if (!/^\p{L}/u.test(limpio)) {
    return 'El nombre debe empezar con una letra.';
  }
  if (!/[\p{L}\p{N}]$/u.test(limpio)) {
    return 'El nombre debe terminar con letra o numero.';
  }
  if (!/^[\p{L}\p{N} '-]+$/u.test(limpio)) {
    return 'Solo se permiten letras, numeros, espacios y guiones simples.';
  }
  if (limpio.includes('.') || limpio.includes('_') || limpio.includes('--')
      || limpio.includes('  ') || limpio.includes("''")) {
    return 'No se permiten puntos, guiones dobles ni espacios seguidos.';
  }

  const letras = (limpio.match(/\p{L}/gu) ?? []).length;
  const digitos = (limpio.match(/\p{N}/gu) ?? []).length;

  if (letras < 2) {
    return 'El nombre debe incluir al menos 2 letras.';
  }
  if (digitos > letras) {
    return 'El nombre parece incoherente: tiene demasiados numeros.';
  }

  return null;
}
