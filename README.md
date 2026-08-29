# 📒 Fichas Caloteiro Back
#### O Fichas Caloteiro Back é o back end de [Fichas Caloteiro](https://github.com/raquelvivi/FixasCaloteiro), um aplicativo focado no gerenciamento de fiados de pequenas e médias empresas. A ideia surgiu a partir de uma necessidade real de um mercado onde trabalhei (Kitanda do Vitor). No mercado, tudo era feito de forma muito informal e pouco prática, utilizando sempre um caderno e fichas avulsas para monitorar os fiados e realizar uma gestão básica.

#### Com o tempo, essa prática se tornou inviável devido à grande quantidade de fichas novas e ao descontrole financeiro geral. Com o aplicativo, tornou-se fácil monitorar o valor total das fichas e das compras, bem como o dinheiro “perdido” e a média de crescimento. Com poucos cliques, é possível modificar fichas, criar novas ou efetuar compras e pagamentos, mantendo sempre o histórico. Dessa forma, um trabalho que antes demorava até dois dias inteiros passou a ser feito em poucas horas, com muito mais dados acessíveis 24 horas por dia.

## 🛠️ Tecnologias Utilizadas
<div align="center">
<table border="0">
  <tr>
<td valign="top">

#### ⚙️ Back-end
<a href="https://github.com/search?q=user%3Araquelvivi+language%3AJavaScript"><img src="https://img.shields.io/badge/Node.js-6a994e.svg?logo=node.js&logoColor=white"></a>
<a href="https://github.com/search?q=user%3Araquelvivi+language%3AJavaScript"><img src="https://img.shields.io/badge/JavaScript-e63946.svg?logo=javaScript&logoColor=white"></a>
<a href="https://github.com/search?q=user%3Araquelvivi+language%3AJavaScript"><img src="https://img.shields.io/badge/Express-343a40.svg?logo=express&logoColor=white"></a>

</td>
<td valign="top">

<!-- 
      Iniciar back:
      npm run dev
      
    -->
  
#### 🗄️ Banco de Dados

<a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-1d3557.svg?logo=postgresql&logoColor=white"></a>
<a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-2a9d8f.svg?logo=supabase&logoColor=white"></a>
<a href="https://node-postgres.com/"><img src="https://img.shields.io/badge/pg-457b9d.svg?logo=postgresql&logoColor=white"></a>

</td>
<td valign="top">

#### 🔄 Arquitetura & API
<img src="https://img.shields.io/badge/API_REST-bc15c2.svg"> 
<img src="https://img.shields.io/badge/Async/Await-d1db0d.svg"> 
<img src="https://img.shields.io/badge/SQL_Transactions-3613c2.svg">

 </td>
  <td valign="top">
    
 #### 🔐 Configuração & Segurança

<a href="https://www.npmjs.com/package/dotenv"><img src="https://img.shields.io/badge/dotenv-48b500.svg?logo=dotenv&logoColor=white"></a>
<a href="https://www.npmjs.com/package/cors"><img src="https://img.shields.io/badge/CORS-8f0303.svg"></a>
</td>
<td valign="top">
  
#### ☁️ Infraestrutura

<a href="https://render.com/"><img src="https://img.shields.io/badge/Render-000000.svg?logo=render&logoColor=white"></a>
<img src="https://img.shields.io/badge/SSL/TLS-1982c4.svg">
</td>
 </tr>
</table>
</div>



#### O back-end foi hospedado na Render e o banco de dados na Supabase, permitindo que o usuário tenha acesso diário e remoto às informações.

### Render
<img width="1877" height="913" alt="image" src="https://github.com/user-attachments/assets/edfa9da2-0b5c-4205-ad88-9fb2b75640cb" />

### Supabase
<img width="1843" height="707" alt="image" src="https://github.com/user-attachments/assets/50f7df5b-6a21-4ee4-8686-a454217b690e" />

### Banco de Dados
<img width="1046" height="611" alt="image" src="https://github.com/user-attachments/assets/b115f92a-18f7-431e-8079-d38895d8aded" />

</br></br>

## Problema
#### O maior problema enfrentado nesse back-end foi, sem dúvida, a parte de pagamentos. Isso ocorreu porque era necessário armazenar as compras anteriores e, obrigatoriamente, limpar os dados das compras já pagas. Para isso, criei na tabela as colunas total e a_pagar.

#### O cliente tem o direito de pagar um valor X, que não necessariamente precisa ser o valor total da compra ou o valor total da dívida. A coluna total representa o valor total da compra, enquanto a_pagar representa o valor restante da compra (ou seja, o valor da dívida).

#### O principal problema estava no cálculo: por algum motivo, sempre que restavam valores pequenos (abaixo de R$ 20,00), o código zerava a dívida daquela compra ou não finalizava corretamente o pagamento. Inicialmente, pensei que fosse um erro de arredondamento, mas com o tempo percebi que o problema era a sobreposição de funções. Na prática, o código não estava “arredondando”, mas sim se perdendo na pilha de chamadas, o que fazia com que os cálculos fossem realizados de forma incorreta.

#### Como solução, utilizei async/await em todo o projeto e padronizei todos os processos de acesso ao banco de dados usando apenas o pool, evitando a mistura de bibliotecas diferentes.

<img width="658" height="692" alt="image" src="https://github.com/user-attachments/assets/c3bf2a5d-8057-4e81-bad8-d1a4ffc54a95" /> <img width="732" height="806" alt="image" src="https://github.com/user-attachments/assets/9f7b0118-707c-49d9-bb6f-37b539c45cd9" /> <img width="445" height="200" alt="image" src="https://github.com/user-attachments/assets/936dd28c-262b-4a15-b15a-d0d2e6dc1cfe" />

</br></br>

## Futuro
#### Para o futuro, planejo criar uma página com informações como: quantidade de compras, quantidade de pagamentos, número de fichas, valor total de dinheiro preso, entre outros dados relevantes. Além disso, pretendo incorporar ao aplicativo Fixas Caloteiro um gerenciador de estoque e preços para o mesmo mercado.

#### Para isso, será melhor unificar os dois bancos de dados, pois assim será mais fácil modificar, por exemplo, o preço da banana diretamente pelo celular, fazendo com que o valor seja automaticamente atualizado em todos os computadores do mercado.
