
const supportsANSI = process.stdout.isTTY && process.env.TERM !== 'dumb';

const styles = supportsANSI
  ? {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      underline: '\x1b[4m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
    }
  : {
      reset: '',
      bold: '',
      underline: '',
      green: '',
      yellow: '',
      blue: '',
      cyan: '',
    };

/**
 * Apply ANSI styles to text.
 *
 * @param {string|string[]} addStyles - A style or an array of styles to apply.
 * @param {string} text - The text to style.
 * @returns {string} - Styled text with ANSI escape codes or plain text fallback.
 */
export default function ansi(addStyles, text) {
    let ansi = "";
    addStyles.forEach((value) => {
        if(typeof styles[value] === "string") {
            ansi += styles[value];
        } else {
            console.warn(`The ANSI style ${value} is not supported.`);
        }
    });

    return `${ansi}${text}${styles.reset}`;
}