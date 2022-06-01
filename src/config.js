const Job = require("./models/Job");
const puppeteer = require("puppeteer");
const qrcode = require("qrcode-terminal");
const { from, merge } = require("rxjs");
const { take } = require("rxjs/operators");
const path = require("path");
const rimraf = require("rimraf");
const moment = require("moment");
let browser = null;
let page = null;

const tmpPath = path.resolve(__dirname, "../tmp");
const SELECTORS = {
  LOADING: "progress",
  INSIDE_CHAT: "document.getElementsByClassName('two')[0]",
  QRCODE_PAGE: "body > div > div > .landing-wrapper",
  QRCODE_DATA: "div[data-ref]",
  QRCODE_DATA_ATTR: "data-ref",
  SEND_BUTTON: 'span[data-icon="send"]',
  CHECKBOX: 'input[type="checkbox"]',
};
const start = async ({ session = true, qrCodeData = false } = {}) => {
  if (!session) {
    await deleteSession(tmpPath);
    console.log("boorrado");
  }
  //Inicia la pagina
  const args = {
    headless: true,
    userDataDir: tmpPath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ["--disable-extensions"],
  };
  try {
    browser = await puppeteer.launch(args);
    page = await browser.newPage();
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36 OPR/68.0.3618.125"
    );

    page.setDefaultTimeout(60000);
    await page.goto("https://web.whatsapp.com");
    if (await isAuthenticated()) {
      return;
    } else {
      if (qrCodeData) {
        console.log("Getting QRCode data...");
        return await getQRCodeData();
      } else {
        await generateQRCode();
      }
    }
  } catch (err) {
    deleteSession(tmpPath);
    throw err;
  }
};
const saveSession = async () => {
  try {
    await page.waitForSelector(SELECTORS.CHECKBOX);
    const checked = await page.$eval(
      '[type="checkbox"]',
      (check) => (check.checked = true)
    );
    if (!checked) {
      await page.click('[type="checkbox"]');
    }
  } catch (err) {
    console.log(err);
  }
};
const getQRCodeData = async () => {
  await page.waitForSelector(SELECTORS.QRCODE_DATA, { timeout: 90000 });

  const qrcodeData = await page.evaluate((SELECTORS) => {
    let qrcodeDiv = document.querySelector(SELECTORS.QRCODE_DATA);
    return qrcodeDiv.getAttribute(SELECTORS.QRCODE_DATA_ATTR);
  }, SELECTORS);

  await saveSession();
  return await qrcodeData;
};
const generateQRCode = async () => {
  try {
    console.log("generating QRCode...");
    const qrcodeData = await getQRCodeData();
    qrcode.generate(qrcodeData, { small: true });
    console.log("QRCode generated! Scan it using Whatsapp App.");
  } catch (err) {
    throw await QRCodeExeption(
      "QR Code can't be generated(maybe your connection is too slow)."
    );
  }
  await waitQRCode();
};
const waitQRCode = async () => {
  // if user scan QR Code it will be hidden
  try {
    await page.waitForSelector(SELECTORS.QRCODE_PAGE, {
      timeout: 20000,
      hidden: true,
    });
  } catch (err) {
    throw await QRCodeExeption("Dont't be late to scan the QR Code.");
  }
};
const QRCodeExeption = async (msg) => {
  await browser.close();
  return "QRCodeException: " + msg;
};
const isAuthenticated = () => {
  console.log("Authenticating...");

  return merge(needsToScan(page), isInsideChat(page)).pipe(take(1)).toPromise();
};
function needsToScan() {
  return from(
    page
      .waitForSelector(SELECTORS.QRCODE_PAGE, {
        timeout: 0,
      })
      .then(() => false)
  );
}
function isInsideChat() {
  return from(
    page
      .waitForFunction(SELECTORS.INSIDE_CHAT, {
        timeout: 0,
      })
      .then(() => true)
  );
}
function deleteSession() {
  rimraf(tmpPath, () => {
    console.log("done");
  });
}
const sendTo = async (phoneOrContact, message) => {
  let phone = phoneOrContact;
  if (typeof phoneOrContact === "object") {
    phone = phoneOrContact.phone;
  }
  let aux = "";
  let nombre = [];
  description = [];
  precio = [];
  urgencia = [];
  modelo = [];
  telf = [];
  date = [];
  let wsp = `https://web.whatsapp.com/send?phone=${phone}&text=`;
  const filto = message.filter((e) => {
    nombre.push(e.name);
    description.push(e.description);
    precio.push(e.precio);
    urgencia.push(e.urgencia);
    modelo.push(e.modelo);
    telf.push(e.telf);
    date.push(e.date);
  });
  for (let i = 0; i < message.length; i++) {
    let msgTotal = `name:%20${encodeURIComponent(
      nombre[i]
    )}%0AModelo:%20${encodeURIComponent(
      modelo[i]
    )}%0ADescription:%20${encodeURIComponent(
      description[i]
    )}%0APrecio:%20${encodeURIComponent(
      precio[i]
    )}%0Atelf:%20${encodeURIComponent(
      telf[i]
    )}%0AUrgencia:%20${encodeURIComponent(
      urgencia[i]
    )}%0ADate:%20${encodeURIComponent(date[i])}%0A`;
    aux = aux + msgTotal;
  }
  const url = wsp + aux;

  try {
    await page.goto(url);
    await page.waitForSelector(SELECTORS.LOADING, {
      hidden: true,
      timeout: 30000,
    });

    await page.waitForSelector(SELECTORS.SEND_BUTTON, { timeout: 10000 });

    await page.keyboard.press("Enter");

    process.stdout.write(`${phone} Sent\n`);

    console.log("Mensaje enviado");

    await new Promise((resolve, reject) => setTimeout(resolve, 6000));

    // page.dispose();
  } catch (err) {
    process.stdout.write(`${phone} Failed\n`);
    console.log("no se pudo enviar el mensaje");
  }
};
const intervalo_alto = async () => {
  // revisando si hay trabajo para enviar s
  const job = await Job.find({ estado: false, urgencia: "alta" });
  // consultando si esta conectado esperando si hay otros mensajes enviando al mismo tiempo
  // if (!browser.isConnected()) {
  //   await start();
  // }
  // si hay elementos entonces envia mensajes
  if (job.length === 0 || !browser.isConnected()) {
    console.log("alta borrado");
  } else if (job.length > 0 && isJobHour()) {
    await send_multiple_message(job);
    setTimeout(intervalo_alto, 4500000);
  } else {
    console.log("No es horario de trabajo pelotudo");
  }
};
const intervalo_medio = async () => {
  const job = await Job.find({ estado: false, urgencia: "media" });
  // if (!browser.isConnected()) {
  //   await start();
  // }
  if (job.length === 0 || !browser.isConnected()) {
    console.log("media borrado");
  } else if (job.length > 0 && isJobHour()) {
    await send_multiple_message(job);
    setTimeout(intervalo_medio, 14478000);
  } else {
    console.log("No es horario de trabajo pelotudo");
  }
};
const intervalo_bajo = async () => {
  const job = await Job.find({ estado: false, urgencia: "baja" });
  // if (!browser.isConnected()) {
  //   await start();
  // }
  if (job.length === 0 || !browser.isConnected()) {
    console.log("baja borrado");
  } else if (job.length > 0 && isJobHour()) {
    await send_multiple_message(job);
    setTimeout(intervalo_bajo, 28800000);
  } else {
    console.log("No es horario de trabajo pelotudo");
  }
};
const enviar = async () => {
  await start();
  console.log("ingrese al alto");
  await intervalo_alto();
  console.log("ingrese al medio");
  await intervalo_medio();
  console.log("ingrese al bajo");
  await intervalo_bajo();
};
const activar = async (id) => {
  if (id === "alta") {
    intervalo_alto();
  }
  if (id === "media") {
    intervalo_medio();
  }
  if (id === "baja") {
    intervalo_bajo();
  }
};
const senToClient = async (phoneOrContact, message) => {
  
  console.log("enter a sentoTOclient");

  let phone = phoneOrContact;
  if (typeof phoneOrContact === "object") {
    phone = phoneOrContact.phone;
  }
  let url = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
  try {
    await page.goto(url);
    await page.waitForSelector(SELECTORS.LOADING, {
      hidden: false,
      timeout: 60000,
    });
    await page.waitForSelector(SELECTORS.SEND_BUTTON, { timeout: 5000 });
    await page.keyboard.press("Enter");
    process.stdout.write(`${phone} Sent\n`);
    console.log("Mensaje enviado");
    await new Promise((resolve, reject) => setTimeout(resolve, 6000));
  } catch (err) {
    process.stdout.write(`${phone} Failed\n`);
    console.log("no se pudo enviar el mensaje");
  }
};
const send_multiple_message = async (prioridad) => {
  await new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(sendTo("51991696266", prioridad));
    }, 3000)
  );
  await new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(sendTo("51966130926", prioridad));
    }, 2000)
  );
  await new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(sendTo("51924113383", prioridad));
    }, 2000)
  );
  await new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(sendTo("51992855000", prioridad));
    }, 2000)
  );
  await new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(sendTo("51900155676", prioridad));
    }, 2000)
  );
  // await new Promise((resolve, reject) =>
  //   setTimeout(() => {
  //     resolve(sendTo("51912982896", prioridad));
  //   }, 2000)
  // );
};
const isJobHour = () => {
  let sunday = "sunday";
  let horaActual = moment().format("HH:mm");
  let actTime = moment(horaActual, "h:mma");
  let beginTime = moment("10:00", "h:mma");
  let endTime = moment("21:00", "h:mma");
  actTime.isBefore(endTime);
  beginTime.isBefore(actTime);

  if (
    actTime.isBefore(endTime) &&
    beginTime.isBefore(actTime) &&
    moment().format("dddd") !== sunday
  ) {
    console.log("enviar mensaje");
    return true;
  } else {
    console.log("No enviar mensaje");

    return false;
  }
};
//enviar();
async function end() {
  try {
    await browser.close();
    console.log("cerrado");
  } catch (e) {
    return {
      msg: "El wsp esta apagado anda a prenderlo :3",
    };
  }
}
module.exports = {
  activar: activar,
  senToClient: senToClient,
  end: end,
  enviar: enviar,
};
