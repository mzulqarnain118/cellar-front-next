const EmptySearchResult = ({ searchState }) => (
  <div className="text-center py-[30px]">
    <span className="material-icons-outined md-dark md-48">search</span>
    <h3 className="pt-[30px] text-[#656565]">No results has been found for {searchState.query}</h3>
  </div>
)

export default EmptySearchResult

// export const EmptySearchResult = styled.div`
//   box-shadow: 0 5px 5px 3px rgba(0, 0, 0, 0.2);
//   text-align: center;
//   padding-top: 30px;
//   padding-bottom: 30px;
//   h3 {
//     padding-top: 30px;
//     color: #656565 !important;
//   }
// `
