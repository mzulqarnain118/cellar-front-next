interface TermsContent {
  type: string
}

const TermsContent = ({ type }: TermsContent) => {
  if (type === 'autoSip') {
    return (
      <p>
        By clicking “Place Your Order” in checkout, you understand and agree that you are enrolling
        in the Auto-Sip™ program, which will automatically initiate and ship orders to you, and that
        you will be billed immediately and every subsequent month, every other month, or every
        quarter (“Delivery Frequency”), depending on the frequency of the delivery you select, until
        you cancel your enrollment. The exact amount of the charges will depend upon the Delivery
        Frequency, the specific program you selected and the offering therein. You will be billed on
        or around the same day each Delivery Frequency. You can cancel your enrollment or modify
        your Delivery Frequency at any time by logging into your account and managing your
        enrollment. Any such cancellation or modification must be completed at least twenty-four
        (24) hours prior to the next Delivery Frequency processing date. If you cannot or do not
        wish to access your account online, you may cancel or modify at any time by contacting
        customer support using the chat functionality or contact form at{' '}
        <a href="https://scoutandcellar.com/contact" target="_blank">
          https://scoutandcellar.com/contact
        </a>
        . Your subscription will begin immediately, and you will be notified with an order
        confirmation email after purchase. All charges will be identified as Scout & Cellar or Wine
        Retriever LLC on your credit card statement. Scout Rewards credits may not be applied to
        Auto-Sip™ orders at checkout. If your card issuing financial institution participates in the
        Card Account Updater program, we may receive an updated card account number and/or
        expiration date for your card on file. Unless you opt out of the program with your card
        issuer, we will update our files and use the new information for any automatic payment
        option in which you have enrolled, including Scout Circle and Auto-Sip™ as applicable. We
        will not receive updated information if your account has been closed.
      </p>
    )
  } else if (type === 'wineClub') {
    return (
      <p>
        By purchasing a membership on{' '}
        <a href="https://scoutandcellar.com" target="_blank">
          ScoutandCellar.com
        </a>{' '}
        you understand that you are joining one of our Wine Clubs and that you will be billed
        immediately and every subsequent month, every other month, or every quarter, depending on
        the frequency of the specific club you selected, until you cancel your membership. The exact
        amount of the charges will depend upon the specific club you selected. You will be billed on
        or around the same day each month. You can cancel your membership at any time by logging
        into your account and cancelling your membership. If you cannot or do not wish to access
        your account online, you can cancel at any time by calling customer support at{' '}
        <a href="tel:9726389918">(972) 638-9918</a> or by sending an email to{' '}
        <a href="mailto:support@scoutandcellar.com">support@scoutandcellar.com</a>. Your membership
        will begin immediately. All charges will be identified as Scout & Cellar or Wine Retriever
        LLC on your credit card statement. If your card issuing financial institution participates
        in the Card Account Updater program, we may receive an updated card account number and/or
        expiration date for your card on file. Unless you opt out of the program with your card
        issuer, we will update our files and use the new information for any automatic payment
        option in which you have enrolled, including Scout Circle and Auto-Sip™ as applicable. We
        will not receive updated information if your account has been closed.
      </p>
    )
  }
}

export default TermsContent
