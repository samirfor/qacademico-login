/**
 * @file login.js
 * Efetua login no sistema Q-Acadêmico Web
 * para IFCE - Módulo Aluno Versão 3.239.000
 * desenvolvido pela © 2018 Qualidata.
 *
 * Usage: node login.js <matricula> <senha>
 * Exemplo: node login.js 200012345678 Abc123456
 *
 * Have a nice day.
 *
 *
 * @license The MIT license, https://opensource.org/licenses/MIT
 * @version 0.1
 * @author  Samir C. Costa, https://github.com/samirfor/
 * @updated 18/05/2018
 * @link    https://github.com/samirfor/qacademico-login
 *
 *
 */

const request = require('request');
const fs = require('fs');
const xpath = require('xpath');
const parse5 = require('parse5');
const xmlser = require('xmlserializer');
const dom = require('xmldom').DOMParser;
eval(fs.readFileSync('./libs/RSA.js', 'utf8'));
eval(fs.readFileSync('./libs/BigInt.js', 'utf8'));
eval(fs.readFileSync('./libs/Barrett.js', 'utf8'));

const urlGenChaves =
  'https://qacademico.ifce.edu.br/qacademico/lib/rsa/gerador_chaves_rsa.asp';
const urlValidaLogin =
  'https://qacademico.ifce.edu.br/qacademico/lib/validalogin.asp';
const login = process.argv[2];
const senha = process.argv[3];
const cookieJar = request.jar();

request(
  {
    url: urlGenChaves,
    jar: cookieJar
  },
  (error, response, body) => {
    if (error) {
      console.log('error:', error);
      return;
    }
    // console.log('response:', response);
    const jskey = body.match(/var key[^]+?;/);
    // console.log('jskey:', jskey[0]);

    eval(jskey[0], 'utf-8');
    setMaxDigits(19);
    // console.log(key);

    encLogin = encryptedString(key, login);
    encSenha = encryptedString(key, senha);
    encSubmit = encryptedString(key, 'OK');
    encTipoUsuario = encryptedString(key, '1');
    // console.log(login, encLogin, senha, encSenha);

    request.post(
      {
        url: urlValidaLogin,
        jar: cookieJar,
        form: {
          LOGIN: encLogin,
          SENHA: encSenha,
          Submit: encSubmit,
          TIPO_USU: encTipoUsuario
        },
        followAllRedirects: true
      },
      (error, response, body) => {
        if (error) {
          console.log('error:', error);
          return;
        }
        // console.log('response:', response);
        // console.log('body:', body);

        const document = parse5.parse(body.toString());
        const xhtml = xmlser.serializeToString(document);
        const doc = new dom().parseFromString(xhtml);
        const select = xpath.useNamespaces({
          x: 'http://www.w3.org/1999/xhtml'
        });
        const nodes = select("//x:div[@class='conteudoTexto']/text()", doc);
        let txt = '';
        nodes.forEach(node => {
          txt += node.nodeValue;
        });
        console.log(txt);

        if (body.search(/Acesso Negado/i)) {
          console.log('false');
          return false;
        }
        console.log('true');
        return true;
      }
    );
  }
);
