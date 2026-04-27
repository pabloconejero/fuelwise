export interface RawStation {
  'C.P.': string;
  'Dirección': string;
  'Horario': string;
  'Latitud': string;               // Spanish decimal: "40,528028"
  'Localidad': string;
  'Longitud (WGS84)': string;      // Spanish decimal: "-3,699253"
  'Margen': string;                // "I" = left, "D" = right, "N" = center/none
  'Municipio': string;
  'Provincia': string;
  'Remisión': string;
  'Rótulo': string;                // brand/name
  'Tipo Venta': string;            // "P" = public, "R" = restricted
  '% BioEtanol': string;
  '% Éster metílico': string;
  'IDEESS': string;                // station ID
  'IDMunicipio': string;
  'IDProvincia': string;
  'IDCCAA': string;
  'Precio Producto'?: string;
  // Price fields — Spanish decimal, empty string = not sold
  'Precio Gasolina 95 E5': string;
  'Precio Gasolina 95 E10': string;
  'Precio Gasolina 95 E25': string;
  'Precio Gasolina 95 E85': string;
  'Precio Gasolina 95 E5 Premium': string;
  'Precio Gasolina 98 E5': string;
  'Precio Gasolina 98 E10': string;
  'Precio Gasoleo A': string;
  'Precio Gasoleo Premium': string;
  'Precio Gasoleo B': string;
  'Precio Bioetanol': string;
  'Precio Biodiesel': string;
  'Precio Gases licuados del petróleo': string;
  'Precio Gas Natural Comprimido': string;
  'Precio Gas Natural Licuado': string;
  'Precio Hidrogeno': string;
  'Precio Adblue': string;
  'Precio Amoniaco': string;
  'Precio Metanol': string;
  'Precio Diésel Renovable': string;
  'Precio Gasolina Renovable': string;
  'Precio Biogas Natural Comprimido': string;
  'Precio Biogas Natural Licuado': string;
}

export interface RawStationsResponse {
  Fecha: string;                   // "DD/MM/YYYY H:MM:SS" (hour may be 1 digit)
  ListaEESSPrecio: RawStation[];
  Nota: string;
  ResultadoConsulta: string;       // "OK" on success
}

export interface RawProvince {
  IDPovincia: string;   // ⚠ API typo: missing 'r' (not IDProvincia)
  IDCCAA: string;
  Provincia: string;
  CCAA: string;
}

export interface RawMunicipality {
  IDMunicipio: string;
  IDProvincia: string;
  IDCCAA: string;
  Municipio: string;
  Provincia: string;
  CCAA: string;
}

export interface RawCommunity {
  IDCCAA: string;
  CCAA: string;
}

export interface RawFuelProduct {
  IDProducto: string;
  NombreProducto: string;
  NombreProductoAbreviatura: string;
}

