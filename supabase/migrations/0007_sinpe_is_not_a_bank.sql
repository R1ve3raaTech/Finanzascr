-- SINPE Móvil es un método de transferencia entre bancos, no una entidad en
-- sí misma: bank_name pasa a ser siempre el banco real (BP, MUCAP, etc.),
-- "SINPE Móvil" queda solo mencionado en la descripción del movimiento.
alter table transactions
  drop constraint transactions_bank_name_check;

alter table transactions
  add constraint transactions_bank_name_check check (
    bank_name in ('BAC', 'BCR', 'BNCR', 'Promerica', 'Davivienda', 'BP', 'MUCAP', 'PayPal', 'Efectivo', 'Otro')
  );
