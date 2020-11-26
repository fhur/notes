const Types = {
  RowDaysSeparator: "RowDaysSeparator",
  RowOption: "RowOption",
};

function takeUntil(arr, predicate) {
  const result = [];
  while (arr.length > 0 && !predicate(arr)) {
    const head = arr.shift();
    result.push(head);
  }
  return result;
}

function getDecimalSeparator() {
  const n = 1.1;
  return n.toLocaleString().substring(1, 2);
}

function getThousandsSeparator() {
  const n = 1000;
  return n.toLocaleString().substring(1, 2);
}

function parseLocaleNumber(numString) {
  const decimalSeparator = getDecimalSeparator();
  const thousandsSeparator = getThousandsSeparator();

  return parseFloat(
    numString
      .replaceAll(thousandsSeparator, "")
      .replaceAll(decimalSeparator, ".")
  );
}

function parseSpotPrice() {
  const text = document.querySelector("#companyDetailsDiv .main-number")
    .innerText;
  const spotPrice = parseLocaleNumber(text.trim().replace("$", ""));
  if (isNaN(spotPrice) || typeof spotPrice !== "number") {
    throw new Error("Unable to find spot price in " + text);
  }
  return spotPrice;
}

function parseSymbol() {
  const symbolText = (document.getElementById("symbol").value || "").trim();
  if (symbolText.length < 3) {
    throw new Error("Unable to parse symbol: " + symbolText);
  }
  return symbolText.toUpperCase();
}

function parseDaysRow(row) {
  const match = row.innerText.match(/\((\d+) days\)/);
  const daysRaw = match && match[1];

  if (!daysRaw) {
    return undefined;
  }

  const days = parseInt(daysRaw);

  if (isNaN(days)) {
    return undefined;
  }

  return { type: Types.RowDaysSeparator, days };
}

function parseOptionRow(row) {
  const columns = row.innerText
    .split(/\s/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "%")
    .map((s) => parseLocaleNumber(s))
    .filter((s) => !isNaN(s));

  if (columns.length != 17) {
    return undefined;
  }

  const [
    callLast,
    callChange,
    callBid,
    callAsk,
    callVolume,
    callOpenInt,
    callImpVol,
    callDelta,
    strike,
    putLast,
    putChange,
    putBid,
    putAsk,
    putVolume,
    putOpenInt,
    putImpVol,
    putDelta,
  ] = columns;

  return {
    type: Types.RowOption,
    option: {
      callLast,
      callChange,
      callBid,
      callAsk,
      callVolume,
      callOpenInt,
      callImpVol,
      callDelta,
      strike,
      putLast,
      putChange,
      putBid,
      putAsk,
      putVolume,
      putOpenInt,
      putImpVol,
      putDelta,
    },
  };
}

function buildAst(parsedRows, context) {
  console.log(parsedRows.length);
  const optionRows = [];
  const recordedAt = Date.now();

  while (parsedRows.length > 0) {
    const head = parsedRows.shift();
    if (head.type !== Types.RowDaysSeparator) {
      throw new Error("Expected a day separator");
    }

    const rows = takeUntil(
      parsedRows,
      (t) => t.type === Types.RowDaysSeparator
    );

    optionRows.push(
      ...rows.map((row) => ({
        days: head.days,
        recordedAt,
        spotPrice: context.spotPrice,
        symbol: context.symbol,
        ...row.option,
      }))
    );
  }

  return optionRows;
}

function parseRows() {
  const parsers = [parseDaysRow, parseOptionRow];

  const rows = Array.from(
    document.querySelectorAll("#optionChainResultBlock tr")
  );

  const parsedRows = [];

  for (const row of rows) {
    for (const parser of parsers) {
      const result = parser(row);

      if (result) {
        parsedRows.push(result);
      }
    }
  }

  return parsedRows;
}

function saveFile(fileName, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  a.click();
}

function main() {
  const context = {
    symbol: parseSymbol(),
    spotPrice: parseSpotPrice(),
  };
  const parsedRows = parseRows();

  const ast = buildAst(parsedRows, context);

  const date = new Date().toISOString().split("T")[0];
  const fileName = `${date}.${context.symbol.toLowerCase()}.json`;

  saveFile(fileName, JSON.stringify(ast));
}

async function selectAllDates() {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function assertNodeAt(selector) {
    const result = Array.from(document.querySelectorAll(selector));
    if (result.length !== 1) {
      throw new Error(`Selector doesn't ${selector} match a single element`);
    }
    return result[0];
  }

  async function checkAll() {
    Array.from(
      document.querySelectorAll("#near-expiration  input[type='checkbox']")
    )
      .filter((i) => !i.checked)
      .forEach((e) => (e.checked = true));
  }

  async function openViewAllExpirationsModal() {
    assertNodeAt("a.view-all-expiration").click();
  }

  async function clickSetExpirationsButton() {
    assertNodeAt("#singleLegModalWindow input.go-btn").click();
  }

  async function clickBtnApply() {
    assertNodeAt("#Bttn_Apply").click();
  }

  async function selectAllStrikes() {
    Array.from(document.querySelectorAll("#selector-strike-box li"))
      .filter((n) => n.innerText === "All")[0]
      .click();
  }

  await selectAllStrikes();
  await sleep(10);
  await openViewAllExpirationsModal();
  await checkAll();
  await sleep(10);
  await clickSetExpirationsButton();
  await sleep(10);
  await clickBtnApply();
}
