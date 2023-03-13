import React from "react";
import PropTypes from "prop-types";
import { Typography, Box } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import { satoshisToBitcoins } from "unchained-bitcoin";

import {
  compareSlicesByPath,
  compareSlicesByBalance,
  compareSlicesByUTXOCount,
  compareSlicesByTime,
} from "../../utils/slices";

// Components
import Copyable from "../Copyable";
import { slicePropTypes, clientPropTypes } from "../../proptypes";
import SliceDetails from "./SliceDetails";

const useStyles = makeStyles((theme) => ({
  panel: {
    boxShadow: `inset 0px 0px 4px 1px ${theme.palette.grey[500]}`,
  },
  spent: {
    textDecoration: "line-through",
  },
}));

const SlicesTable = ({
  slices,
  search,
  paging,
  title,
  client,
  network,
  disabled,
}) => {
  const classes = useStyles();

  const options = {
    search,
    paging,
    detailPanelType: "single",
    showTitle: (title && title.length) || false,
    emptyRowsWhenPaging: false,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50],
  };
  options.toolbar = options.showTitle && options.search;
  let columns = [
    {
      title: "Path Suffix",
      field: "bip32Path",
      render: (rowData) => (
        <Typography>{rowData.bip32Path.replace("m", "*")}</Typography>
      ),
      type: "string",
      defaultSort: "asc",
      customSort: compareSlicesByPath,
    },
    {
      title: "UTXOs",
      field: "utxos",
      width: "50px",
      render: (rowData) => <Typography>{rowData.utxos.length}</Typography>,
      customSort: compareSlicesByUTXOCount,
    },
    {
      title: "Balance",
      field: "balanceSats",
      render: (rowData) => (
        <Typography>
          {satoshisToBitcoins(rowData.balanceSats).toString()}
        </Typography>
      ),
      customSort: compareSlicesByBalance,
    },
    {
      title: "Last Used",
      field: "lastUsed",
      render: (rowData) => <Typography>{rowData.lastUsed || ""}</Typography>,
      customSort: compareSlicesByTime,
    },
    {
      title: "Address",
      field: "address",
      sorting: false,
      render: (rowData) => (
        <Copyable
          text={rowData.multisig.address}
          showIcon
          showText
          code
          className={
            rowData.addressUsed && rowData.balanceSats.isEqualTo(0)
              ? classes.spent
              : ""
          }
        />
      ),
    },
  ];

  // filter out any columns that should be disabled
  columns = columns.filter((column) => !disabled.includes(column.field));
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.length &&
              columns.map((column) => <TableCell>{column.title}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {slices.length &&
            slices.map((slice) => (
              <TableRow
                key={slice.lastUsedTime}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="td" scope="row" colSpan={columns.length}>
                  <Box p={1} className={classes.panel}>
                    <SliceDetails
                      client={client}
                      slice={slice}
                      network={network}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  // return (
  // <MaterialTable
  //   options={options}
  //   columns={columns}
  //   data={slices}
  //   detailPanel={[
  //     {
  //       tooltip: "Address Details",
  //       render: (rowData) => (
  //         <Box p={1} className={classes.panel}>
  //           <SliceDetails client={client} slice={rowData} network={network} />
  //         </Box>
  //       ),
  //     },
  //   ]}
  // />
  // );
};

SlicesTable.propTypes = {
  slices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes)).isRequired,
  search: PropTypes.bool,
  paging: PropTypes.bool,
  title: PropTypes.string,
  client: PropTypes.shape(clientPropTypes).isRequired,
  network: PropTypes.string.isRequired,
  disabled: PropTypes.arrayOf(PropTypes.string),
};

SlicesTable.defaultProps = {
  search: false,
  paging: false,
  title: "",
  disabled: [],
};

export default SlicesTable;
