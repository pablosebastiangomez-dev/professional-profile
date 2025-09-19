REPORT zcrypto_api.

DATA: lv_url     TYPE string,
      lo_http    TYPE REF TO if_http_client,
      lv_result  TYPE string,
      json       TYPE REF TO cl_trex_json_parser,
      lt_data    TYPE STANDARD TABLE OF string,
      lv_name    TYPE string,
      lv_price   TYPE string.

* URL pública de CoinGecko (top 5 monedas en USD)
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
  WRITE: / 'Error al crear HTTP Client'.
  EXIT.
ENDIF.

* Enviar request
lo_http->send( ).
lo_http->receive( ).

* Guardar la respuesta en variable
lv_result = lo_http->response->get_cdata( ).

* Mostrar JSON (simplificado)
SPLIT lv_result AT ',' INTO TABLE lt_data.

WRITE: / 'Top 5 Criptomonedas (USD):'.
LOOP AT lt_data INTO DATA(lv_line).
  IF lv_line CS '"name"' OR lv_line CS '"current_price"'.
    WRITE: / lv_line.
  ENDIF.
ENDLOOP.

