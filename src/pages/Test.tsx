import React, { useState } from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';

// Define the available locales as a union type
type Locale = 'en' | 'fr';

const LOCALES = {
    ENGLISH: 'en' as Locale,
    FRENCH: 'fr' as Locale,
};

function Test() {
    // Initialize locale as Czech ('cs' is not handled by react-intl here)
    const [locale, setLocale] = useState<Locale | 'cs'>('cs');  // 'cs' for Czech

    const messages = {
        en: {
            greeting: "Hello, World!",
        },
        fr: {
            greeting: "Bonjour le monde!",
        },
    };

    const translateFunction = () => {
        // Toggle between Czech and English
        setLocale(locale === 'cs' ? LOCALES.ENGLISH : 'cs');
    };

    return (
        <div>
            {locale === 'cs' && <p>text in Czech</p>} {/* Display Czech text initially */}

            <button onClick={translateFunction}>Translate</button>

            {locale !== 'cs' && (
                <IntlProvider locale={locale} messages={messages[locale]}>
                    <div>
                        <h1>
                            <FormattedMessage id="greeting" defaultMessage="Hello, World!" />
                        </h1>
                    </div>
                </IntlProvider>
            )}

            {/* Additional session validity handling */}
            {/* sessionValid logic omitted for simplicity */}
        </div>
    );
}

export default Test;
