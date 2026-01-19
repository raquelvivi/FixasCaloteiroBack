# 📒 Fixas Caloteiro Back
#### O FixasCaloteiroBack é o back end de [Fixas Caloteiro](https://github.com/raquelvivi/FixasCaloteiro), um aplicativo focado em gerenciar fiados de pequenas a medias empresas. A ideia surgiu de uma necessidade de um mercado onde trabalhei (Kitanda Do Vitor), No mercado tudo era sempre muito informal e pouco pratico usando sempre um caderno e fichas avulsas para monitorar os fiados e gerencia basica. Tal pratica com o tempo ser tornou inviavem pela quantidade de fichas novas e descontrole financeiro regional, com o aplicativo é facil monitorar o valor total de fichas e compras bem como o dinheiro "perdido" e media de crescimento. Com poucos cliques é possivel modificar fichas, criar novas, ou efetuar compras e pagamentos mantendo sempre o historico, fazendo um trabalho que demorava 2 dias inteiros para poucas horas com muitos mais dados acessiveis a 24/h por dia

#### O Back foi colocado na Rander e o banco de dados na Supabese para que o usuario tenha acesso diario e remoto.

### Render
<img width="1877" height="913" alt="image" src="https://github.com/user-attachments/assets/edfa9da2-0b5c-4205-ad88-9fb2b75640cb" />

### Supabase
<img width="1843" height="707" alt="image" src="https://github.com/user-attachments/assets/50f7df5b-6a21-4ee4-8686-a454217b690e" />

### Banco de Dados
<img width="1046" height="611" alt="image" src="https://github.com/user-attachments/assets/b115f92a-18f7-431e-8079-d38895d8aded" />

## Problema

#### Meu maior problema nesse back end foi sem duvida a parte de pagar, isso porque era necessario guardar as compras anteriores e obrigatoriamente limpar os dados de compras ja pagadas. Para isso eu criei na tabela as colunas total e apagar, uma vez que o cliente tem direito a pagar um valor X, que não obrigatoriamente tem de ser o valor total da compra ou o valor total da divida. Total é o valor total da compra e o apagar é o valor que resta da compra (o valor da divida), meu maior problema foi o calculo que por algum motivo sempre que restava valores pequenos como abaixo de 20 reais o codigo arredondava para 0 e zerava a divida daquela compra ou não completava ela. Com o tempo percebi que o problema era a sobrepossição da função que na realidade ele não estava "arredondando" e sim se perdendo na pilha de contas fazendo ele calcular os dados errados. Como solução coloquei em todo o projeto await e async junto a isso fiz todos os processos com o banco de dados usando o pool ao inves de misturar bibliotecas.

<img width="658" height="692" alt="image" src="https://github.com/user-attachments/assets/c3bf2a5d-8057-4e81-bad8-d1a4ffc54a95" />

<img width="732" height="806" alt="image" src="https://github.com/user-attachments/assets/9f7b0118-707c-49d9-bb6f-37b539c45cd9" />

<img width="445" height="200" alt="image" src="https://github.com/user-attachments/assets/936dd28c-262b-4a15-b15a-d0d2e6dc1cfe" />



