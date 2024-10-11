import React from "react";



export default function CodeSnippetComponent({ slice }) {

  React.useEffect(() => {
    const tastryScript = slice?.primary?.rich_text?.find(el => el?.text?.includes("</script"))?.text;
    if(!tastryScript) return

    // Create the script element
    const script = document.createElement("script");

    const srcStart = tastryScript?.indexOf('src="') + 5; // Add 5 to skip past 'src="'
    const srcEnd = tastryScript?.indexOf('"', srcStart);


    script.src = tastryScript.substring(srcStart, srcEnd)

    // Attach onload handler properly
    script.onload = () => {
      const tastryEvent = new Event('load');
      window.dispatchEvent(tastryEvent);
    };

    // Append the script to the body
    document.body.appendChild(script);

    // Clean up and remove the script when the component is unmounted or refreshed
    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [slice?.primary?.rich_text]);

  return <div>{ slice?.primary?.rich_text?.find(el => el?.text?.includes("</div")) &&  <div  dangerouslySetInnerHTML={{ __html: slice?.primary?.rich_text?.find(el => el?.text?.includes("</div"))?.text} } />}</div>
}
