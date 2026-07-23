alter table transactions
  drop constraint transactions_bank_name_check;

alter table transactions
  add constraint transactions_bank_name_check check (
    bank_name in ('BAC', 'BCR', 'BNCR', 'Promerica', 'Davivienda', 'BP', 'SINPE', 'PayPal', 'Efectivo', 'Otro')
  );
