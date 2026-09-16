/**
 * Chave usada para levar o CEP digitado na pré-visualização do carrinho até a
 * etapa de Entrega. Fica só na sessão do navegador: não altera o endereço
 * salvo na conta nem nenhuma regra de frete — apenas evita que o cliente
 * perca o CEP que acabou de consultar ao avançar para o checkout.
 */
export const CHECKOUT_CEP_KEY = "olb:checkout-cep";
