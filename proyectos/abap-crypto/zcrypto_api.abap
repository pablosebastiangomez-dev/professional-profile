REPORT zcrypto_api.

* Proyecto ABAP - Consumo de API pública de criptomonedas (CoinGecko)
* Autor: Pablo Sebastián Gómez

DATA: lv_url     TYPE string,
      lo_http    TYPE REF TO if_http_client,
      lv_result  TYPE string,
      lt_lines   TYPE STANDARD TABLE OF string.

* URL pública de CoinGecko (Top 5 criptomonedas por capitalización)
lv_url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false'.

* Crear cliente HTTP
CALL METHOD cl_http_client=>create_by_url
  EXPORTING
    url                = lv_url
  IMPORTING
    client             = lo_http
  EXCEPTIONS
    argument_not_found = 1
    plugin_not_active  = 2
    internal_error     = 3
    OTHERS             = 4.

IF sy-subrc <> 0.
  WRITE: / '❌ Error al crear cliente HTTP'.
  EXIT.
ENDIF.

* Enviar request y recibir respuesta
lo_http->send( ).
lo_http->receive( ).

* Guardar respuesta en variable
lv_result = lo_http->response->get_cdata( ).

* Separar el JSON en líneas simples (visualización básica)
SPLIT lv_result AT ',' INTO TABLE lt_lines.

WRITE: / '✅ Top 5 Criptomonedas desde CoinGecko:'.
ULINE.

LOOP AT lt_lines INTO DATA(lv_line).
  IF lv_line CS '"name"' OR lv_line CS '"current_price"'.
    WRITE: / lv_line.
  ENDIF.
ENDLOOP.
