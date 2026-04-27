apliquei redis para fazer o cache dos tokens dos providers e evitar chamadas desnecessárias para o banco de dados, melhorando a performance do sistema.
usuario pode selecionar a origem da migracao, ver os sesu propios arquivos e escolher quais deseja migrar, alem de poder selecionar o provedor de destino.



FAZER:
quando terminar a migration, enviar um email para o usuario informando que a migracao foi concluida
webhooks de quando um arquivo for adicionado em algum, ele seja migrado automaticamente para o destino selecionado, sem a necessidade de intervenção manual. Isso pode ser feito utilizando as APIs dos provedores de armazenamento em nuvem, como Google Drive, Dropbox, OneDrive